document.addEventListener('DOMContentLoaded', function () {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const uploadBtn = document.getElementById('uploadBtn');
    const locationName = document.getElementById('locationName');
    const locationLat = document.getElementById('locationLat');
    const locationLng = document.getElementById('locationLng');

    let files = [];
    let map;
    let marker = null;
    let currentLocation = null;

    fetch('/api/check-session', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            const authLink = document.querySelector('.nav-link[href="/pages/auth.html"]');
            if (data.loggedIn && authLink) {
                authLink.innerHTML = '<i class="fas fa-user me-1"></i> Профиль';
                authLink.href = '/pages/profile.html';
            }
        });

    const navbar = document.getElementById('mainNavbar');
    let lastScroll = 0;

    window.addEventListener('scroll', function () {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            // Вверху страницы - показываем хедер
            navbar.classList.remove('navbar-hide');
            return;
        }

        if (currentScroll > lastScroll && !navbar.classList.contains('navbar-hide')) {
            // Прокрутка вниз - скрываем хедер
            navbar.classList.add('navbar-hide');
        } else if (currentScroll < lastScroll && navbar.classList.contains('navbar-hide')) {
            // Прокрутка вверх - показываем хедер
            navbar.classList.remove('navbar-hide');
        }

        lastScroll = currentScroll;
    });

    // Инициализация карты
    function initMap() {
        map = L.map('map').setView([53.9, 27.5667], 7); // Центр Беларуси

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Обработчик клика по карте
        map.on('click', function (e) {
            if (marker) {
                map.removeLayer(marker);
            }

            marker = L.marker(e.latlng, {
                draggable: true
            }).addTo(map);

            // Получаем название места (в демо просто координаты)
            locationName.value = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
            locationLat.value = e.latlng.lat;
            locationLng.value = e.latlng.lng;

            // При перемещении маркера обновляем координаты
            marker.on('dragend', function () {
                const newPos = marker.getLatLng();
                locationName.value = `${newPos.lat.toFixed(4)}, ${newPos.lng.toFixed(4)}`;
                locationLat.value = newPos.lat;
                locationLng.value = newPos.lng;
            });
        });
    }

    // Инициализация карты
    initMap();

    // Кнопка "Мое местоположение"
    document.getElementById('locateBtn').addEventListener('click', function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const userLocation = L.latLng(position.coords.latitude, position.coords.longitude);

                // Удаляем предыдущий маркер
                if (marker) {
                    map.removeLayer(marker);
                }

                // Добавляем новый маркер
                marker = L.marker(userLocation, {
                    draggable: true
                }).addTo(map);

                // Центрируем карту
                map.setView(userLocation, 13);

                // Заполняем поля
                locationName.value = "Мое местоположение";
                locationLat.value = userLocation.lat;
                locationLng.value = userLocation.lng;

                // При перемещении маркера обновляем координаты
                marker.on('dragend', function () {
                    const newPos = marker.getLatLng();
                    locationName.value = `${newPos.lat.toFixed(4)}, ${newPos.lng.toFixed(4)}`;
                    locationLat.value = newPos.lat;
                    locationLng.value = newPos.lng;
                });
            }, function () {
                alert('Не удалось определить ваше местоположение');
            });
        } else {
            alert('Геолокация не поддерживается вашим браузером');
        }
    });

    // Обработчики для drag and drop
    uploadArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        this.classList.add('active');
    });

    uploadArea.addEventListener('dragleave', function () {
        this.classList.remove('active');
    });

    uploadArea.addEventListener('drop', function (e) {
        e.preventDefault();
        this.classList.remove('active');
        handleFiles(e.dataTransfer.files);
    });

    // Обработчик клика по области загрузки
    uploadArea.addEventListener('click', function () {
        fileInput.click();
    });

    // Обработчик выбора файлов
    fileInput.addEventListener('change', function () {
        if (this.files.length > 0) {
            handleFiles(this.files);
        }
    });

    // Функция обработки выбранных файлов
    function handleFiles(selectedFiles) {
        // Очищаем предыдущий выбор
        files = [];
        previewContainer.innerHTML = '';

        // Проверяем каждый файл
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];

            // Проверка типа файла
            if (!file.type.match('image.*')) {
                continue;
            }

            // Проверка размера файла (до 10MB)
            if (file.size > 10 * 1024 * 1024) {
                continue;
            }

            files.push(file);

            // Создаем превью
            const reader = new FileReader();
            reader.onload = function (e) {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item animate-fade-in';
                previewItem.innerHTML = `
                            <img src="${e.target.result}" class="preview-img" alt="Превью">
                            <div class="preview-remove" data-index="${files.length - 1}">
                                <i class="fas fa-times"></i>
                            </div>
                        `;
                previewContainer.appendChild(previewItem);

                // Анимация добавления
                previewItem.style.animationDelay = `${i * 0.1}s`;

                // Обработчик удаления превью
                previewItem.querySelector('.preview-remove').addEventListener('click', function (e) {
                    e.stopPropagation();
                    const index = parseInt(this.getAttribute('data-index'));
                    files.splice(index, 1);
                    previewContainer.removeChild(previewItem);

                    // Обновляем индексы у оставшихся элементов
                    const removeButtons = document.querySelectorAll('.preview-remove');
                    removeButtons.forEach((btn, idx) => {
                        btn.setAttribute('data-index', idx);
                    });
                });
            };
            reader.readAsDataURL(file);
        }
    }

    // Обработчик отправки фотографий
    uploadBtn.addEventListener('click', function () {
        if (files.length === 0) {
            alert('Пожалуйста, выберите хотя бы одно фото');
            return;
        }

        const title = document.getElementById('photoTitle').value.trim();
        const description = document.getElementById('photoDescription').value.trim();
        const tags = document.getElementById('photoTags').value.trim();
        const lat = locationLat.value;
        const lng = locationLng.value;

        if (!title) {
            alert('Пожалуйста, укажите название');
            return;
        }

        if (!lat || !lng) {
            alert('Пожалуйста, укажите местоположение на карте');
            return;
        }

        // Создаем объект с данными поста
        const postData = {
            title: title,
            description: description,
            tags: tags.split(',').map(tag => tag.trim()),
            location: {
                name: locationName.value,
                lat: parseFloat(lat),
                lng: parseFloat(lng)
            },
            photos: [],
            date: new Date().toISOString(),
            author: {
                name: "Текущий пользователь", // В реальном приложении брать из системы аутентификации
                avatar: "https://randomuser.me/api/portraits/women/44.jpg"
            }
        };

        // Читаем файлы и добавляем в postData
        const readers = [];
        let filesProcessed = 0;

        for (let i = 0; i < files.length; i++) {
            const reader = new FileReader();
            reader.onload = function (e) {
                postData.photos.push({
                    url: e.target.result,
                    name: files[i].name,
                    type: files[i].type
                });

                filesProcessed++;

                // Когда все файлы обработаны
                if (filesProcessed === files.length) {
                    // В реальном приложении здесь будет AJAX-запрос к серверу
                    console.log('Данные для отправки:', postData);

                    // Сохраняем пост в localStorage (для демонстрации)
                    savePostToFeed(postData);

                    // Показываем уведомление об успехе
                    alert('Фотографии успешно опубликованы!');

                    // Сбрасываем форму
                    resetForm();
                }
            };
            reader.readAsDataURL(files[i]);
            readers.push(reader);
        }
    });

    // Функция сохранения поста в "ленту" (в реальном приложении - на сервер)
    function savePostToFeed(postData) {
        // Получаем текущие посты из localStorage
        let feed = JSON.parse(localStorage.getItem('belogoFeed')) || [];

        // Добавляем новый пост в начало массива
        feed.unshift(postData);

        // Сохраняем обратно в localStorage
        localStorage.setItem('belogoFeed', JSON.stringify(feed));

        // В реальном приложении здесь будет редирект на страницу ленты
        // или обновление ленты через AJAX
    }

    // Функция сброса формы
    function resetForm() {
        files = [];
        previewContainer.innerHTML = '';
        fileInput.value = '';
        document.getElementById('photoTitle').value = '';
        document.getElementById('photoDescription').value = '';
        document.getElementById('photoTags').value = '';
        locationName.value = '';
        locationLat.value = '';
        locationLng.value = '';

        if (marker) {
            map.removeLayer(marker);
            marker = null;
        }
    }
});