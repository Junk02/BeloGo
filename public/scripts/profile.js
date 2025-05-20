const bioTextarea = document.getElementById('editBio');

// Функция автоувеличения
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto'; // сброс
    textarea.style.height = textarea.scrollHeight + 'px';
}

bioTextarea.addEventListener('input', () => autoResizeTextarea(bioTextarea));

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/check-session', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            const authLink = document.querySelector('.nav-link[href="/pages/auth.html"]');
            if (data.loggedIn && authLink) {
                authLink.innerHTML = '<i class="fas fa-user me-1"></i> Профиль';
                authLink.href = '/pages/profile.html';
            }
        });

    // Инициализируем высоту при загрузке
    autoResizeTextarea(bioTextarea);

    document.getElementById('avatarUpload').addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('avatarPreview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    loadProfile();
});

async function loadProfile() {
    try {
        const response = await fetch('/profile', { credentials: 'include' });
        const data = await response.json();

        if (!response.ok || !data.user) {
            window.location.href = '/pages/auth.html';
            return;
        }

        // Отображение на странице
        document.querySelector('.avatar-img').src = data.user.avatar || '/img/default-avatar.png';
        document.getElementById('name').textContent = data.user.name;
        document.getElementById('username').textContent = '@' + data.user.nickname;
        document.getElementById('userinfo').textContent = data.user.bio || 'Добавьте информацию о себе.';
        document.getElementById('editBio').value = data.user.bio || '';



        // Заполнение формы
        document.getElementById('editName').value = data.user.name;
        document.getElementById('editBio').value = data.user.bio || '';
        autoResizeTextarea(document.getElementById('editBio'));
    } catch (err) {
        console.error('Ошибка при получении профиля:', err);
        window.location.href = '/pages/auth.html';
    }
}

async function saveProfile() {
    const name = document.getElementById('editName').value.trim();
    const bio = document.getElementById('editBio').value.trim();
    const errorBox = document.getElementById('profileError');

    // Сброс ошибок
    errorBox.classList.add('d-none');
    errorBox.textContent = '';

    // Валидация имени
    if (!/^[A-Za-zА-Яа-яЁё]+$/.test(name)) {
        return showValidationError('Имя может содержать только буквы.');
    }

    try {
        const response = await fetch('/profile/update', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, bio })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Ошибка при обновлении профиля');

        // Обновить отображение
        document.getElementById('name').textContent = data.name;
        document.getElementById('userinfo').textContent = data.bio;

        const modalEl = document.getElementById('editSetProfileModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    } catch (err) {
        showValidationError('Не удалось сохранить профиль. Попробуйте позже.');
        console.error(err);
    }

    function showValidationError(message) {
        errorBox.textContent = message;
        errorBox.classList.remove('d-none');
    }
}


// Выход из аккаунта
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await fetch('/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/pages/auth.html';
    } catch (err) {
        console.error('Ошибка при выходе:', err);
        alert('Не удалось выйти. Попробуйте позже.');
    }
});

document.getElementById('deleteAccountBtn').addEventListener('click', async () => {
    const confirmDelete = confirm('Вы уверены, что хотите удалить аккаунт? Это действие необратимо!');
    if (!confirmDelete) return;

    try {
        const response = await fetch('/delete-account', {
            method: 'POST',
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Ошибка при удалении аккаунта');

        alert('Аккаунт успешно удалён.');
        window.location.href = '/pages/auth.html';
    } catch (err) {
        console.error('Ошибка при удалении аккаунта:', err);
        alert('Не удалось удалить аккаунт. Попробуйте позже.');
    }
});

document.getElementById('avatarUpload').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById('avatarPreview').src = e.target.result;
    };
    reader.readAsDataURL(file);
});

async function saveAvatar() {
    const fileInput = document.getElementById('avatarUpload');
    const file = fileInput.files[0];
    if (!file) return alert('Сначала выберите изображение.');

    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await fetch('/upload-avatar', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Ошибка при загрузке');

        document.getElementById('profileAvatar').src = data.avatar + '?t=' + Date.now();

        const modalEl = document.getElementById('avatarModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    } catch (err) {
        console.error('Ошибка при загрузке аватарки:', err);
        alert('Не удалось загрузить аватарку');
    }
}
