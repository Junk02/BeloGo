// Обновлённый loadimg.js

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
    const photoCounter = document.getElementById('photoCounter');
    const photoWarning = document.getElementById('photoWarning');

    const photoToast = new bootstrap.Toast(document.getElementById('photoToast'));

    fetch('/api/check-session', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            const authLink = document.querySelector('.nav-link[href="/pages/auth.html"]');
            if (data.loggedIn && authLink) {
                authLink.innerHTML = '<i class="fas fa-user me-1"></i> Профиль';
                authLink.href = '/pages/profile.html';
            }
        });



    function showPreview() {
        previewContainer.innerHTML = '';
        files.forEach((file, i) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const item = document.createElement('div');
                item.classList.add('preview-item');

                const img = document.createElement('img');
                img.src = e.target.result;
                img.classList.add('preview-img');

                const removeBtn = document.createElement('div');
                removeBtn.classList.add('preview-remove');
                removeBtn.innerHTML = '&times;';
                removeBtn.addEventListener('click', () => {
                    files.splice(i, 1);
                    showPreview(); // Перерисовать превью
                });

                item.appendChild(img);
                item.appendChild(removeBtn);
                previewContainer.appendChild(item);
            };
            reader.readAsDataURL(file);
        });

        photoCounter.textContent = `${files.length} / 5 фото`;
        if (files.length < 5) {
            photoWarning.classList.add('d-none');
        }
    }

    fileInput.addEventListener('click', function (e) {
        if (files.length >= 5) {
            e.preventDefault(); // Блокируем открытие окна выбора
            photoToast.show(); // Показываем уведомление
        }
    });

    fileInput.addEventListener('change', function (e) {
        const selected = Array.from(e.target.files).filter(f => f && f.size > 0);
        if (selected.length === 0) return;

        const remainingSlots = 5 - files.length;
        if (remainingSlots <= 0) {
            photoWarning.classList.remove('d-none');
            fileInput.value = '';
            return;
        }

        const toAdd = selected.slice(0, remainingSlots);
        files.push(...toAdd);
        showPreview();

        setTimeout(() => {
            fileInput.value = '';
        }, 0);
    });


    uploadArea.addEventListener('click', function () {
        fileInput.click();
    });

    uploadArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function () {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function (e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');

        const dropped = Array.from(e.dataTransfer.files).filter(f => f && f.size > 0);
        const remainingSlots = 5 - files.length;

        if (remainingSlots <= 0) {
            photoWarning.classList.remove('d-none');
            return;
        }

        const toAdd = dropped.slice(0, remainingSlots);
        files.push(...toAdd);
        showPreview();
    });


    // Загрузка: Здесь вы можете отправлять файлы через fetch или FormData
    uploadBtn.addEventListener('click', function () {
        if (files.length === 0) {
            alert('Пожалуйста, выберите хотя бы одну фотографию.');
            return;
        }

        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file); // <-- исправлено
        });

        formData.append('title', document.getElementById('photoTitle').value);
        formData.append('description', document.getElementById('photoDescription').value);
        formData.append('latitude', locationLat.value); // <-- исправлено
        formData.append('longitude', locationLng.value); // <-- исправлено
        //formData.append('tags', document.getElementById('photoTags').value); // можно использовать позже
        //formData.append('locationName', locationName.value); // тоже опционально

        fetch('/upload-post', { // <-- убедись, что путь такой же как на сервере
            method: 'POST',
            credentials: 'include', // если используешь сессию
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                alert('Пост успешно загружен!');
                window.location.href = '/pages/feed.html';
            })
            .catch(error => {
                console.error('Ошибка загрузки:', error);
                alert('Ошибка при загрузке поста.');
            });
    });



    function initMap() {
        const belarusBounds = L.latLngBounds(
            L.latLng(51.25, 23.00),
            L.latLng(56.17, 32.80)
        );

        // Инициализация карты
        const map = L.map('map', {
            maxBounds: belarusBounds,
            maxBoundsViscosity: 1.0,
            attributionControl: false,
            minZoom: 5,
            maxZoom: 17
        }).setView([53.9, 27.5], 7);

        // Добавляем тайлы OSM
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            noWrap: true // Предотвращаем повторение карты
        }).addTo(map);

        // Добавляем поиск с ограничением по Беларуси
        /*const geocoder = L.Control.Geocoder.nominatim({
            bounds: belarusBounds,
            countrycodes: 'by', // Только Беларусь
            limit: 5
        });
        
        L.Control.geocoder({
            geocoder: geocoder,
            position: 'topright',
            placeholder: 'Искать в Беларуси...',
            errorMessage: 'Место не найдено',
            suggestMinLength: 3,
            queryMinLength: 3,
            defaultMarkGeocode: false,
            showResultIcons: true,
            collapsed: false,
            expand: 'click'
        })
        .on('markgeocode', function(e) {
            // Проверяем, что найденное место в пределах Беларуси
            if (belarusBounds.contains(e.geocode.center)) {
                map.fitBounds(e.geocode.bbox, {
                    maxZoom: 14,
                    padding: [50, 50]
                });
            if (!belarusBounds.contains(e.geocode.center)) {
                alert('Это место находится за пределами Беларуси. Пожалуйста, выберите локацию внутри страны.');
                return;
            }
                
                // Добавляем маркер
                L.marker(e.geocode.center)
                    .addTo(map)
                    .bindPopup(e.geocode.name)
                    .openPopup();
            } else {
                alert('Пожалуйста, выбирайте места только в пределах Беларуси');
            }
        })
        .addTo(map); */

        // Ограничение перемещения
        map.on('drag', function () {
            map.panInsideBounds(belarusBounds, { animate: false });
        });


        map.on('click', function (e) {
            if (marker) map.removeLayer(marker);
            marker = L.marker(e.latlng, { draggable: true }).addTo(map);

            locationName.value = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
            locationLat.value = e.latlng.lat;
            locationLng.value = e.latlng.lng;

            marker.on('dragend', function () {
                const pos = marker.getLatLng();
                locationName.value = `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`;
                locationLat.value = pos.lat;
                locationLng.value = pos.lng;
            });
        });
    }

    initMap();





    document.getElementById('locateBtn').addEventListener('click', function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const userLocation = L.latLng(position.coords.latitude, position.coords.longitude);
                if (marker) map.removeLayer(marker);
                marker = L.marker(userLocation, { draggable: true }).addTo(map);
                map.setView(userLocation, 13);

                locationName.value = 'Мое местоположение';
                locationLat.value = userLocation.lat;
                locationLng.value = userLocation.lng;

                marker.on('dragend', function () {
                    const pos = marker.getLatLng();
                    locationName.value = `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`;
                    locationLat.value = pos.lat;
                    locationLng.value = pos.lng;
                });
            });
        }
    });
});
