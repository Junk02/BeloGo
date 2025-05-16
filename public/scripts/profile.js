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
        document.getElementById('info').textContent = `Ваш никнейм: ${data.user.nickname}`;
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

// врячется хедер
document.addEventListener('DOMContentLoaded', function () {
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
});