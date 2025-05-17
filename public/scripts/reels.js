document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const verticalWrapper = document.querySelector('.vertical-swiper .swiper-wrapper');
    const loadingIndicator = document.querySelector('.swiper-loading');
    const verticalTemplate = document.getElementById('vertical-slide-template');
    const horizontalTemplate = document.getElementById('horizontal-slide-template');
    
    // Переменные состояния
    let verticalSwiper;
    let currentPage = 1;
    const postsPerPage = 3;
    let isLoading = false;
    let allPostsLoaded = false;

    // 1. Проверка сессии пользователя
    async function checkUserSession() {
        try {
            const response = await fetch('/api/check-session', { 
                credentials: 'include' 
            });
            const data = await response.json();
            
            const authLink = document.querySelector('.nav-link[href="/pages/auth.html"]');
            if (data.loggedIn && authLink) {
                authLink.innerHTML = '<i class="fas fa-user me-1"></i> Профиль';
                authLink.href = '/pages/profile.html';
            }
        } catch (error) {
            console.error('Ошибка при проверке сессии:', error);
        }
    }

    // 2. Загрузка постов из базы данных
    async function loadPosts(page = 1) {
        if (isLoading || allPostsLoaded) return;
        
        isLoading = true;
        loadingIndicator.classList.add('active');
        
        try {
            const response = await fetch(`/api/posts?page=${page}&limit=${postsPerPage}`);
            const data = await response.json();
            
            if (data.posts.length === 0) {
                allPostsLoaded = true;
                return;
            }
            
            createSlides(data.posts);
            
            if (page === 1) {
                initSwipers();
            } else {
                verticalSwiper.update();
            }
            
            currentPage++;
        } catch (error) {
            console.error('Ошибка при загрузке постов:', error);
        } finally {
            isLoading = false;
            loadingIndicator.classList.remove('active');
        }
    }

    // 3. Создание слайдов
    function createSlides(posts) {
        posts.forEach(post => {
            const verticalClone = verticalTemplate.content.cloneNode(true);
            const horizontalWrapper = verticalClone.querySelector('.horizontal-swiper .swiper-wrapper');
            
            // Добавляем все изображения поста как горизонтальные слайды
            post.images.forEach((image, index) => {
                const horizontalClone = horizontalTemplate.content.cloneNode(true);
                
                const img = horizontalClone.querySelector('img');
                img.src = image.url;
                img.alt = post.title || `Пост ${post.id}`;
                
                // Предзагрузка следующего изображения
                if (index < post.images.length - 1) {
                    const nextImg = new Image();
                    nextImg.src = post.images[index + 1].url;
                }
                
                const title = horizontalClone.querySelector('h5');
                title.textContent = post.title || `Пост ${post.id}`;
                
                const description = horizontalClone.querySelector('p');
                description.textContent = post.description || '';
                
                horizontalWrapper.appendChild(horizontalClone);
            });
            
            verticalWrapper.appendChild(verticalClone);
        });
    }

    // 4. Инициализация свайперов
    function initSwipers() {
        // Вертикальный свайпер
        verticalSwiper = new Swiper('.vertical-swiper', {
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
                translate: [0, '100%', 0],
                },
            },
            speed: 800,
            preloadImages: true,
            loadPrevNext: true,
            loadPrevNextAmount: 2,
            on: {
                reachEnd: function() {
                    if (!allPostsLoaded) {
                        loadPosts(currentPage);
                    }
                },
                slideChange: function() {
                    // Прелоад следующего слайда
                    const nextIndex = this.activeIndex + 1;
                    if (nextIndex < this.slides.length) {
                        const nextSlide = this.slides[nextIndex];
                        const images = nextSlide.querySelectorAll('img');
                        images.forEach(img => {
                            if (!img.src) img.src = img.dataset.src;
                        });
                    }
                }
            }
        });

        // Горизонтальные свайперы
        document.querySelectorAll('.horizontal-swiper').forEach(container => {
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
                    translate: [0, 0, -400],
                    },
                    next: {
                    translate: [0, '100%', 0],
                    },
                },
                speed: 400,
            });
        });

        // Обработка колеса мыши
        document.addEventListener('wheel', function(e) {
            const activeHorizontalSwiper = document.querySelector('.horizontal-swiper.swiper-slide-active');
            if (activeHorizontalSwiper && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // Инициализация
    checkUserSession();
    loadPosts();
});