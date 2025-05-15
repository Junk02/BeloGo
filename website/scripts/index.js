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