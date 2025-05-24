fetch('http://localhost:3000/public/partials/header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;
        console.log(data);

        // Ждём отрисовки и запускаем всё
        requestAnimationFrame(() => {
            const path = window.location.pathname;
            console.log(path);
const links = document.querySelectorAll('.navbar-nav .nav-link');
            const normalize = p => p.replace(/\/index\.html$/, '/').replace(/\/+$/, '');
            links.forEach(link => {
                const linkPath = new URL(link.href).pathname;
                console.log(linkPath);
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

            const addPostBtn = document.getElementById('add-post-btn');

            if (addPostBtn) {
                addPostBtn.addEventListener('click', async (e) => {
                    e.preventDefault();

                    try {
                        const response = await fetch('/api/check-session', {
                            credentials: 'include'
                        });

                        if (response.ok) {
                            const data = await response.json();
                            if (data.loggedIn) {
                                window.location.href = '/public/pages/loadimg.html';
                            } else {
                                window.location.href = '/public/pages/auth.html';
                            }
                        } else {
                            window.location.href = '/public/pages/auth.html';
                        }
                    } catch (error) {
                        console.error('Ошибка при проверке сессии:', error);
                        window.location.href = '/public/pages/auth.html';
                    }
                });
            }


        });
    });
