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



    fetch('/api/posts')
        .then(res => res.json())
        .then(posts => {
            const container = document.getElementById('post-container');
            posts.forEach(post => {
                const slide = document.createElement('div');
                slide.classList.add('swiper-slide');

                // Вложенный горизонтальный swiper
                let innerSlides = '';
                post.photos.forEach(photo => {
                    innerSlides += `
          <div class="swiper-slide">
            <div class="position-relative h-100">
              <img src="${photo}" class="img" alt="Фото">
              <div class="slide-content">
                <h5>${post.title}</h5>
                <p>${post.description || ''} <a href="#" style="color: rgb(200, 200, 200);
                text-decoration: burlywood"> Подробнее... </a> </p>
              </div>
            </div>
          </div>`;
                });

                slide.innerHTML = `
        <div class="swiper-container horizontal-swiper">
          <div class="swiper-wrapper">
            ${innerSlides}
          </div>
          <div class="swiper-pagination"></div>
        </div>
      `;

                container.appendChild(slide);
            });

            // Пересоздаём Swiper'ы
            verticalSwiper.update();
            container.querySelectorAll('.horizontal-swiper').forEach(swiper => {
                new Swiper(swiper, {
                    direction: 'horizontal',
                    slidesPerView: 1,
                    spaceBetween: 0,
                    pagination: {
                        el: swiper.querySelector('.swiper-pagination'),
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
                });
            });
        })
        .catch(err => console.error('Ошибка при загрузке постов:', err));

});