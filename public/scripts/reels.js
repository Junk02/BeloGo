document.addEventListener('DOMContentLoaded', function () {

    fetch('/api/check-session', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            const authLink = document.querySelector('.nav-link[href="/pages/auth.html"]');
            if (data.loggedIn && authLink) {
                authLink.innerHTML = '<i class="fas fa-user me-1"></i> Профиль';
                authLink.href = '/pages/profile.html';
            }
        });

    const verticalSwiper = new Swiper('.vertical-swiper', {
        direction: 'vertical',
        slidesPerView: 1,
        spaceBetween: 0,
        mousewheel: true,
        pagination: {
            el: '.swiper-pagination-vertical',
            clickable: true,
        },
        effect: 'creative',
        creativeEffect: {
            prev: {
                shadow: true,
                translate: [0, 0, -400],
                opacity: 0
            },
            next: {
                translate: [0, '100%', 0],
                opacity: 0
            },
        },
        speed: 800,
        on: {
            // Скрываем предыдущий слайд после перехода
            slideChange: function () {
                const previousSlide = this.slides[this.previousIndex];
                previousSlide.style.opacity = '0';
                previousSlide.style.pointerEvents = 'none';

                // Показываем текущий слайд
                const activeSlide = this.slides[this.activeIndex];
                activeSlide.style.opacity = '1';
                activeSlide.style.pointerEvents = 'auto';
            }
        }
    });

    // Инициализация всех горизонтальных свайперов с fade-эффектом
    const horizontalSwipers = document.querySelectorAll('.horizontal-swiper');
    horizontalSwipers.forEach(container => {
        new Swiper(container, {
            direction: 'horizontal',
            slidesPerView: 1,
            spaceBetween: 0,
            pagination: {
                el: container.querySelector('.swiper-pagination'),
                clickable: true,
            },
            effect: 'creative',
            creativeEffect: {
                prev: {
                    shadow: true,
                    translate: [-400, 0, 0],
                    opacity: 0
                },
                next: {
                    translate: ['100%', 0, 0],
                    opacity: 0
                },
            },
            speed: 800,
            on: {
                // Скрываем предыдущий слайд после перехода
                slideChange: function () {
                    const previousSlide = this.slides[this.previousIndex];
                    previousSlide.style.opacity = '0';
                    previousSlide.style.pointerEvents = 'none';

                    // Показываем текущий слайд
                    const activeSlide = this.slides[this.activeIndex];
                    activeSlide.style.opacity = '1';
                    activeSlide.style.pointerEvents = 'auto';
                }
            }
        });
    });

    // Обработка событий для предотвращения конфликтов свайпов
    document.querySelectorAll('.horizontal-swiper').forEach(swiper => {
        swiper.addEventListener('wheel', (e) => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();
            }
        });
    });
});