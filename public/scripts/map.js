document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/check-session', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            const authLink = document.querySelector('.nav-link[href="/pages/auth.html"]');
            if (data.loggedIn && authLink) {
                authLink.innerHTML = '<i class="fas fa-user me-1"></i> Профиль';
                authLink.href = '/pages/profile.html';
            }
        });
});

// Инициализация карты
const belarusBounds = L.latLngBounds(
    //L.latLng(51.25, 23.00),
    //L.latLng(56.17, 32.80)
);

// Инициализация карты
const map = L.map('map', {
    maxBounds: belarusBounds,
    maxBoundsViscosity: 1.0,
    attributionControl: false,
    minZoom: 6,
    maxZoom: 17
}).setView([53.9, 27.5], 7);

// Добавление слоя карты
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

map.setMaxBounds(belarusBounds);
map.on('drag', function () {
    map.panInsideBounds(belarusBounds, { animate: false });
});

// Примеры одобренных меток (в реальном приложении будут загружаться с сервера)


// Иконки для разных категорий
const markerIcons = {
    attraction: L.divIcon({
        html: '<i class="fas fa-landmark" style="color: #6f42c1; font-size: 24px;"></i>',
        className: 'custom-marker-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 24]
    }),
    restaurant: L.divIcon({
        html: '<i class="fas fa-utensils" style="color: #e63946; font-size: 24px;"></i>',
        className: 'custom-marker-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 24]
    }),
    hotel: L.divIcon({
        html: '<i class="fas fa-hotel" style="color: #1d3557; font-size: 24px;"></i>',
        className: 'custom-marker-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 24]
    }),
    nature: L.divIcon({
        html: '<i class="fas fa-tree" style="color: #2a9d8f; font-size: 24px;"></i>',
        className: 'custom-marker-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 24]
    }),
    other: L.divIcon({
        html: '<i class="fas fa-map-marker-alt" style="color: #457b9d; font-size: 24px;"></i>',
        className: 'custom-marker-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 24]
    }),
    pending: L.divIcon({
        html: '<i class="fas fa-clock" style="color: #ffb703; font-size: 24px;"></i>',
        className: 'custom-marker-icon pending-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 24]
    })
};

fetch('/api/posts')
    .then(res => res.json())
    .then(posts => {
        posts.forEach(post => {
            // Проверяем наличие координат
            if (!post.latitude || !post.longitude) return;
            console.log(post);

            const popupContent = `
<div class="custom-popup p-2" style="max-width: 260px; font-family: 'Segoe UI', sans-serif;">
    <div class="d-flex align-items-center mb-2">
    
    
    <a href="/users/${post.author.nickname}" class="text-decoration-none fw-semibold text-dark">
        <img src="${post.author.avatar}" alt="${post.author.name}" 
        class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;">
    </a>
    
    
    <a href="/users/${post.author.nickname}" class="text-decoration-none fw-semibold text-dark">
                <div>
                    ${post.author.name}
                    <br>
                    <small class="text-muted">@${post.author.nickname}</small>
                </div>
            

        </a>
    </div>

    <h6 class="mb-1 text-primary">${post.title}</h6>
    <p class="mb-2 text-muted" style="font-size: 0.9rem;">${post.description.slice(0, 20)}...</p>

    ${post.photos && post.photos.length > 0 ? `
    <div class="popup-photos mb-2 text-center">
        <img src="${post.photos[0]}" alt="${post.title}" 
             class="rounded img-fluid" style="max-height: 120px; object-fit: cover;">
    </div>` : ''}

    <div class="d-flex justify-content-center align-items-center">
        <button class="btn btn-sm btn-outline-secondary show-details">
        <a href="/pages/post.html?id=${post.id}" class="btn btn-sm">
            <i class="fas fa-info-circle me-1"></i> Подробнее
        </a>
        </button>
    </div>
</div>
`;


            const marker = L.marker([post.latitude, post.longitude], {
                icon: markerIcons.other
            }).addTo(map);

            marker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'custom-popup-wrapper'
            });

            marker.on('popupopen', function () {
                document.querySelector('.show-details')?.addEventListener('click', () => {
                    window.location.href = `/post/${post.id}`;
                });
            });
        });
    })
    .catch(err => {
        console.error('Ошибка при загрузке постов для карты:', err);
    });


// Функция для генерации звёзд рейтинга
function generateRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}



// Получение названия категории
function getCategoryName(category) {
    const names = {
        attraction: "Достопримечательность",
        restaurant: "Ресторан/Кафе",
        hotel: "Отель",
        nature: "Природа",
        other: "Другое"
    };
    return names[category] || category;
}

// Переменные для добавления новой метки
let newMarker = null;
let clickHandler = null;


document.getElementById('cancel-marker-btn').addEventListener('click', function () {
    // Скрыть форму
    document.getElementById('marker-form').classList.remove('show');

    // Удалить временную метку
    if (newMarker) {
        map.removeLayer(newMarker);
        newMarker = null;
    }

    // Удалить обработчик клика
    if (clickHandler) {
        map.off('click', clickHandler);
        clickHandler = null;
    }
});

document.getElementById('submit-marker-btn').addEventListener('click', function () {
    const title = document.getElementById('marker-title').value.trim();
    const description = document.getElementById('marker-description').value.trim();
    const category = document.getElementById('marker-category').value;

    if (!title || !description) {
        showToast('Ошибка', 'Пожалуйста, заполните все поля', 'danger');
        return;
    }

    if (!newMarker) {
        showToast('Ошибка', 'Пожалуйста, выберите место на карте', 'danger');
        return;
    }

    const position = newMarker.getLatLng();

    // Здесь должен быть AJAX-запрос к серверу
    // В демо-версии просто добавляем в массив pendingMarkers
    const newMarkerData = {
        id: Date.now(),
        lat: position.lat,
        lng: position.lng,
        title: title,
        description: description,
        category: category
    };

    // В реальном приложении:
    // $.post('/api/markers', newMarkerData, function(response) {
    //     showToast('Успех', 'Метка отправлена на модерацию', 'success');
    // });

    // Для демо:
    pendingMarkers.push(newMarkerData);
    showToast('Успех', 'Метка отправлена на модерацию', 'success');

    // Сброс формы
    document.getElementById('marker-form').classList.remove('show');
    document.getElementById('marker-title').value = '';
    document.getElementById('marker-description').value = '';

    // Удаление временной метки
    map.removeLayer(newMarker);
    newMarker = null;

    // Удаление обработчика клика
    if (clickHandler) {
        map.off('click', clickHandler);
        clickHandler = null;
    }
});


// Обновление позиции маркера
function updateMarkerPosition(latlng) {
    // В реальном приложении можно обновлять координаты в форме
    console.log('Новые координаты:', latlng.lat, latlng.lng);
}

// Показать уведомление
function showToast(title, message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');

    // Установка цвета в зависимости от типа
    toast.className = 'toast';
    toast.classList.add('show');

    if (type === 'success') {
        toast.querySelector('.toast-header').className = 'toast-header bg-success text-white';
    } else if (type === 'danger') {
        toast.querySelector('.toast-header').className = 'toast-header bg-danger text-white';
    } else {
        toast.querySelector('.toast-header').className = 'toast-header bg-primary text-white';
    }

    toastTitle.textContent = title;
    toastMessage.textContent = message;

    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}