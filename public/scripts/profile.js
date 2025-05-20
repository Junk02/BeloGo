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


        // Заполнение формы
        document.getElementById('editName').value = data.user.name;
        document.getElementById('editBio').value = data.user.bio || '';
    } catch (err) {
        console.error('Ошибка при получении профиля:', err);
        window.location.href = '/pages/auth.html';
    }
}

async function saveProfile() {
    const name = document.getElementById('editName').value.trim();
    const bio = document.getElementById('editBio').value.trim();

    if (!name) return alert('Имя не может быть пустым');

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
        console.error(err);
        alert('Не удалось сохранить профиль');
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

document.getElementById('avatarUpload').addEventListener('change', async function () {
    const file = this.files[0];
    if (!file) return;

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

        // Обновить аватар на странице
        document.getElementById('profileAvatar').src = data.avatar + '?t=' + Date.now(); // кэш-бастер

        // Закрыть модальное окно
        const modalEl = document.getElementById('avatarModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    } catch (err) {
        console.error('Ошибка при загрузке аватарки:', err);
        alert('Не удалось загрузить аватарку');
    }
});
