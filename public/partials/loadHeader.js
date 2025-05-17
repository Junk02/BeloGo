fetch('/partials/header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;

        // Ждём отрисовки и запускаем всё
        requestAnimationFrame(() => {
            // === 1. Подсветка активной ссылки ===
            const path = window.location.pathname;
            const links = document.querySelectorAll('.navbar-nav .nav-link');
            const normalize = p => p.replace(/\/index\.html$/, '/').replace(/\/+$/, '');
            links.forEach(link => {
                const linkPath = new URL(link.href).pathname;
                if (normalize(linkPath) === normalize(path)) {
                    link.classList.add('active');
                }
            });

            // === 2. Анимация скрытия хедера при скролле ===
            const navbar = document.getElementById('mainNavbar');
            let lastScroll = 0;

            window.addEventListener('scroll', () => {
                const currentScroll = window.pageYOffset;

                if (currentScroll <= 0) {
                    navbar.classList.remove('navbar-hide');
                    return;
                }

                if (currentScroll > lastScroll && !navbar.classList.contains('navbar-hide')) {
                    navbar.classList.add('navbar-hide');
                } else if (currentScroll < lastScroll && navbar.classList.contains('navbar-hide')) {
                    navbar.classList.remove('navbar-hide');
                }

                lastScroll = currentScroll;
            });
        });
    });
