document.addEventListener('DOMContentLoaded', function () {
    const navbar = document.getElementById('mainNavbar');
    let lastScroll = 0;

    fetch('/api/check-session', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            const authLink = document.querySelector('.nav-link[href="/pages/auth.html"]');
            if (data.loggedIn && authLink) {
                authLink.innerHTML = '<i class="fas fa-user me-1"></i> Профиль';
                authLink.href = '/pages/profile.html';
            }
        });
    
    

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