document.addEventListener('DOMContentLoaded', function() {
            // Инициализация вертикального свайпера с анимацией creative
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
                    },
                    next: {
                        translate: [0, "100%", 0],
                    },
                },
                speed: 800,
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
                    effect: 'grid',
                    cardsEffect: {
                        crosscards: true
                    },
                    speed: 400,
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