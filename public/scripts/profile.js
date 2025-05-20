document.addEventListener('DOMContentLoaded', function () {
    // Анимация элементов с задержкой
    fetch('/api/check-session', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            const authLink = document.querySelector('.nav-link[href="/pages/auth.html"]');
            if (data.loggedIn && authLink) {
                authLink.innerHTML = '<i class="fas fa-user me-1"></i> Профиль';
                authLink.href = '/pages/profile.html';
            }
        });

    const elements = document.querySelectorAll('.animate__animated');
    elements.forEach((el, index) => {
        if (el.classList.contains('animate__delay-1s') ||
            el.classList.contains('animate__delay-2s') ||
            el.classList.contains('animate__delay-3s') ||
            el.classList.contains('animate__delay-4s')) {
            return;
        }

        el.style.animationDelay = `${index * 0.1}s`;
    });
});


async function loadProfile() {
    try {
        const response = await fetch('http://localhost:3000/profile', {
            credentials: 'include'
        });
        const data = await response.json();

        if (!response.ok || !data.user) {
            window.location.href = '/pages/auth.html';
            return;
        }

        document.getElementById('welcome').textContent = `Добро пожаловать, ${data.user.name}!`;
        document.getElementById('info').textContent = `@${data.user.nickname}`;
        console.log(data.user.bio);
    } catch (err) {
        console.log('Ошибка при получении данных. Перенаправление на вход.');
        window.location.href = '/pages/auth.html';
    }
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch('http://localhost:3000/logout', {
        method: 'POST',
        credentials: 'include'
    });
    window.location.href = '/pages/auth.html';
});

loadProfile();

// Выбор аватарки
function selectAvatar(element, imgUrl) {
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    element.dataset.selectedAvatar = imgUrl;
}

// Сохранение аватарки
function saveAvatar() {
    const selected = document.querySelector('.avatar-option.selected');
    if (selected) {
        const avatarUrl = selected.dataset.selectedAvatar;
        document.querySelector('.avatar-img').src = avatarUrl;

        // Анимация
        const avatarContainer = document.querySelector('.avatar-container');
        avatarContainer.classList.add('animate__animated', 'animate__bounceIn');
        setTimeout(() => {
            avatarContainer.classList.remove('animate__animated', 'animate__bounceIn');
        }, 1000);

        // Закрытие модального окна
        const modal = bootstrap.Modal.getInstance(document.getElementById('avatarModal'));
        modal.hide();
    }
}

// Загрузка фото
document.getElementById('avatarUpload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            // Создаем новый вариант аватарки
            const newAvatarOption = document.createElement('div');
            newAvatarOption.className = 'm-2 avatar-option selected';
            newAvatarOption.innerHTML = `<img src="${event.target.result}" class="rounded-circle" width="80" height="80">`;
            newAvatarOption.onclick = function () {
                selectAvatar(this, event.target.result);
            };

            // Убираем выделение с других вариантов
            document.querySelectorAll('.avatar-option').forEach(opt => {
                opt.classList.remove('selected');
            });

            // Добавляем новый вариант в начало
            document.querySelector('.modal-body .d-flex').prepend(newAvatarOption);
            newAvatarOption.dataset.selectedAvatar = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Сохранение профиля
async function saveProfile() {
    const name = document.getElementById('editName').value;
    const bio = document.getElementById('editBio').value;

    try {
        const response = await fetch('/profile/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, bio })
        });

        if (!response.ok) {
            throw new Error('Ошибка при сохранении данных');
        }

        const result = await response.json();

        // Обновление на странице
        document.querySelector('.profile-name').textContent = result.name || name;
        document.querySelector('.profile-bio').textContent = result.bio || bio;

        // Анимация
        document.querySelector('.profile-name').classList.add('animate__animated', 'animate__pulse');
        setTimeout(() => {
            document.querySelector('.profile-name').classList.remove('animate__animated', 'animate__pulse');
        }, 1000);

        // Закрытие модального окна
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
        modal.hide();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось сохранить изменения. Попробуйте позже.');
    }
}