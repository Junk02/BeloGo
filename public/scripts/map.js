// Инициализация карты
const map = L.map('map').setView([53.7098, 27.9534], 7);

// Добавление слоя карты
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Границы Беларуси (упрощенные)
const belarusBounds = L.latLngBounds(
    L.latLng(51.25, 23.17), // Юго-запад
    L.latLng(56.17, 32.77)   // Северо-восток
);
map.setMaxBounds(belarusBounds);
map.on('drag', function () {
    map.panInsideBounds(belarusBounds, { animate: false });
});

// Примеры одобренных меток (в реальном приложении будут загружаться с сервера)
const approvedMarkers = [
    {
        id: 1,
        lat: 53.9022,
        lng: 27.5618,
        title: "Минск",
        description: "Столица Беларуси",
        category: "attraction"
    },
    {
        id: 2,
        lat: 52.0975,
        lng: 23.6877,
        title: "Брестская крепость",
        description: "Мемориальный комплекс",
        category: "attraction"
    },
    {
        id: 3,
        lat: 54.5136,
        lng: 30.4334,
        title: "Орша",
        description: "Город в Витебской области",
        category: "other"
    }
];

// Примеры меток на модерации (в реальном приложении будут загружаться с сервера)
const pendingMarkers = [
    {
        id: 101,
        lat: 53.6789,
        lng: 27.1416,
        title: "Новое кафе",
        description: "Открылось недавно",
        category: "restaurant"
    }
];

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

// Добавление одобренных меток на карту
approvedMarkers.forEach(marker => {
    const popupContent = `
                <div class="custom-popup">
                    <h6>${marker.title}</h6>
                    <p>${marker.description}</p>
                    <small class="text-muted">Категория: ${getCategoryName(marker.category)}</small>
                </div>
            `;

    L.marker([marker.lat, marker.lng], {
        icon: markerIcons[marker.category]
    })
        .addTo(map)
        .bindPopup(popupContent);
});

// Добавление меток на модерации (обычно только для администратора)
pendingMarkers.forEach(marker => {
    const popupContent = `
                <div class="custom-popup">
                    <h6>${marker.title} <span class="badge bg-warning text-dark">На модерации</span></h6>
                    <p>${marker.description}</p>
                    <small class="text-muted">Категория: ${getCategoryName(marker.category)}</small>
                </div>
            `;

    L.marker([marker.lat, marker.lng], {
        icon: markerIcons['pending']
    })
        .addTo(map)
        .bindPopup(popupContent);
});

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

// Обработчики кнопок
document.getElementById('add-marker-btn').addEventListener('click', function () {
    // Анимация кнопки
    this.classList.add('animate__rubberBand');
    setTimeout(() => {
        this.classList.remove('animate__rubberBand');
    }, 1000);

    // Показать форму
    document.getElementById('marker-form').classList.add('show');

    // Установить обработчик клика по карте
    clickHandler = map.on('click', function (e) {
        // Удалить предыдущую временную метку, если есть
        if (newMarker) {
            map.removeLayer(newMarker);
        }

        // Добавить новую временную метку
        newMarker = L.marker(e.latlng, {
            icon: markerIcons['pending'],
            draggable: true
        }).addTo(map);

        // Обновить позицию при перетаскивании
        newMarker.on('dragend', function () {
            updateMarkerPosition(this.getLatLng());
        });

        updateMarkerPosition(e.latlng);
    });
});

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

// Кнопка "Мое местоположение"
document.getElementById('locate-btn').addEventListener('click', function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const userLocation = L.latLng(position.coords.latitude, position.coords.longitude);

            // Проверяем, находится ли локация в пределах Беларуси
            if (belarusBounds.contains(userLocation)) {
                map.flyTo(userLocation, 13);

                // Добавляем временную метку
                if (newMarker) {
                    map.removeLayer(newMarker);
                }

                newMarker = L.marker(userLocation, {
                    icon: L.divIcon({
                        html: '<i class="fas fa-user" style="color: #6f42c1; font-size: 24px;"></i>',
                        className: 'custom-marker-icon',
                        iconSize: [24, 24],
                        iconAnchor: [12, 24]
                    })
                }).addTo(map)
                    .bindPopup('<b>Ваше местоположение</b>')
                    .openPopup();

                // Анимация кнопки
                const btn = document.getElementById('locate-btn');
                btn.classList.add('animate__rubberBand');
                setTimeout(() => {
                    btn.classList.remove('animate__rubberBand');
                }, 1000);
            } else {
                showToast('Ошибка', 'Вы находитесь за пределами Беларуси', 'danger');
            }
        }, function () {
            showToast('Ошибка', 'Не удалось определить ваше местоположение', 'danger');
        });
    } else {
        showToast('Ошибка', 'Геолокация не поддерживается вашим браузером', 'danger');
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