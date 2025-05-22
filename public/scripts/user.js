document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const nickname = params.get('nickname');

    if (!nickname) {
        document.body.innerHTML = '<p class="text-center mt-5">Никнейм не указан</p>';
        return;
    }

    try {
        const response = await fetch(`/api/users/${nickname}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Ошибка загрузки профиля');

        document.getElementById('profileAvatar').src = data.user.avatar || '/img/default-avatar.jpg';
        document.getElementById('name').textContent = data.user.name;
        document.getElementById('username').textContent = '@' + data.user.nickname;
        document.getElementById('userinfo').textContent = data.user.bio || 'Пользователь пока ничего о себе не рассказал.';

        renderPosts(data.posts);
    } catch (err) {
        console.error(err);
        document.body.innerHTML = '<p class="text-center mt-5 text-danger">Не удалось загрузить профиль</p>';
    }
});

function renderPosts(posts) {
    const container = document.getElementById('userPhotosGrid');
    if (!posts || posts.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Постов пока нет</p>';
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="col-md-4 col-6 mb-3">
            <a href="/pages/post.html?id=${post.id}" class="text-decoration-none">
                <div class="photo-thumbnail">
                    <img src="${post.preview_photo || '/img/default-preview.jpg'}" class="img-fluid" alt="${post.title}">
                    <div class="photo-overlay d-flex align-items-center justify-content-center">
                        <div class="photo-stats text-white text-center">
                            <h6 class="mb-0">${post.title}</h6>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    `).join('');
}

