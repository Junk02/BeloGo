document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/check-session', { credentials: 'include' })
    .then(response => response.json())
    .then(data => {
      const authLink = document.querySelector('.nav-link[href="/pages/auth.html"]');
      if (data.loggedIn && authLink) {
        authLink.innerHTML = '<i class="fas fa-user me-1"></i> Профиль';
        authLink.href = '/pages/profile.html';
      }
    });
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  const wrapper = document.getElementById('post-wrapper');

  if (!postId) return;

  fetch(`/api/posts/${postId}`)
    .then(res => res.json())
    .then(post => {
      let slides = '';
      post.photos.forEach(photo => {
        slides += `
              <div class="swiper-slide">
                <div class="position-relative h-100">
                  <img src="${photo}" class="img" alt="Фото">
                  <div class="slide-content">
                    <div class="contsl">
                      <a href="/pages/user.html?nickname=${post.author_nickname}">
                        <img src="${post.author_avatar || '/img/default-avatar.jpg'}" class="rounded-circle" style="width: 50px; height: 50px; object-fit: cover; border: 1px solid #000;">
                      </a>
                      <div style="padding-left: 10px">
                        <h5>${post.title}</h5>
                        <p>${post.description || ''}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>`;
      });

      wrapper.innerHTML = slides;

      new Swiper('.horizontal-swiper', {
        direction: 'horizontal',
        slidesPerView: 1,
        pagination: {
          el: '.swiper-pagination',
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
        speed: 800
      });
    })
    .catch(err => {
      console.error('Ошибка при получении поста:', err);
      wrapper.innerHTML = '<p class="text-center text-danger mt-5">Пост не найден.</p>';
    });
});

document.addEventListener('click', function (e) {
  const likeBtn = e.target.closest('.like-btn');
  if (!likeBtn) return;

  const icon = likeBtn.querySelector('i');
  const countEl = likeBtn.querySelector('.count');

  // Эффект "вспышки"
  likeBtn.classList.add('liked');
  setTimeout(() => likeBtn.classList.remove('liked'), 500);

  // Тогглим класс и число
  const isActive = likeBtn.classList.toggle('active');
  icon.classList.toggle('far', !isActive);
  icon.classList.toggle('fas', isActive);

  let count = parseInt(countEl.textContent, 10);
  countEl.textContent = isActive ? count + 1 : count - 1;
});