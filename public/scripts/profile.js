const bioTextarea = document.getElementById('editBio');

function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto'; // сброс
  textarea.style.height = textarea.scrollHeight + 'px';
}

bioTextarea.addEventListener('input', () => autoResizeTextarea(bioTextarea));

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

  // Инициализируем высоту при загрузке
  autoResizeTextarea(bioTextarea);

  document.getElementById('avatarUpload').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById('avatarPreview').src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  loadProfile();
});

async function loadProfile() {
  try {
    const response = await fetch('/profile', { credentials: 'include' });
    const data = await response.json();

    if (!response.ok || !data.user) {
      window.location.href = '/pages/auth.html';
      return;
    }

    document.querySelector('.avatar-img').src = data.user.avatar || '/img/default-avatar.png';
    document.getElementById('avatarPreview').src = data.user.avatar || '/img/default-avatar.png';
    document.getElementById('name').textContent = data.user.name;
    document.getElementById('username').textContent = '@' + data.user.nickname;
    document.getElementById('userinfo').textContent = data.user.bio || 'Добавьте информацию о себе.';
    document.getElementById('editName').value = data.user.name;
    document.getElementById('editBio').value = data.user.bio || '';
    autoResizeTextarea(bioTextarea);

    if (data.posts) {
      renderUserPosts(data.posts);
    }

  } catch (err) {
    console.error('Ошибка при получении профиля:', err);
    window.location.href = '/pages/auth.html';
  }
}

function renderUserPosts(posts) {
  const container = document.getElementById('userPhotosGrid');

  if (!posts.length) {
    container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-camera fa-3x mb-3 text-muted"></i>
                <p class="text-muted">Нет опубликованных постов</p>
            </div>
        `;
    return;
  }

  container.innerHTML = posts.map(post => `
        <div class="col-md-4 col-6 mb-3">
            <a href="/pages/post.html?id=${post.id}" class="text-decoration-none">
                <div class="photo-thumbnail">
                    <img src="${post.preview || '/img/default-preview.jpg'}" class="img-fluid" alt="Фото">
                    <div class="photo-overlay">
                        <div class="photo-stats text-white">
                            <h6 class="mb-0">${post.title}</h6>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    `).join('');
}


async function saveProfile() {
  const name = document.getElementById('editName').value.trim();
  const bio = document.getElementById('editBio').value.trim();
  const errorBox = document.getElementById('profileError');

  // Сброс ошибок
  errorBox.classList.add('d-none');
  errorBox.textContent = '';

  // Валидация имени
  if (!/^[A-Za-zА-Яа-яЁё]+$/.test(name)) {
    return showValidationError('Имя может содержать только буквы.');
  }

  try {
    const response = await fetch('/profile/update', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Ошибка при обновлении профиля');

    // Обновить отображение
    document.getElementById('name').textContent = data.name;
    document.getElementById('userinfo').textContent = data.bio;

    const modalEl = document.getElementById('editSetProfileModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  } catch (err) {
    showValidationError('Не удалось сохранить профиль. Попробуйте позже.');
    console.error(err);
  }

  function showValidationError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove('d-none');
  }
}


// Выход из аккаунта
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await fetch('/logout', {
      method: 'POST',
      credentials: 'include'
    });
    window.location.href = '/pages/auth.html';
  } catch (err) {
    console.error('Ошибка при выходе:', err);
    alert('Не удалось выйти. Попробуйте позже.');
  }
});

document.getElementById('deleteAccountBtn').addEventListener('click', async () => {
  const confirmDelete = confirm('Вы уверены, что хотите удалить аккаунт? Это действие необратимо!');
  if (!confirmDelete) return;

  try {
    const response = await fetch('/delete-account', {
      method: 'POST',
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Ошибка при удалении аккаунта');

    alert('Аккаунт успешно удалён.');
    window.location.href = '/pages/auth.html';
  } catch (err) {
    console.error('Ошибка при удалении аккаунта:', err);
    alert('Не удалось удалить аккаунт. Попробуйте позже.');
  }
});

document.getElementById('avatarUpload').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById('avatarPreview').src = e.target.result;
  };
  reader.readAsDataURL(file);
});

async function saveAvatar() {
  const fileInput = document.getElementById('avatarUpload');
  const file = fileInput.files[0];
  if (!file) return alert('Сначала выберите изображение.');

  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await fetch('/upload-avatar', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Ошибка при загрузке');

    document.getElementById('profileAvatar').src = data.avatar + '?t=' + Date.now();

    const modalEl = document.getElementById('avatarModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  } catch (err) {
    console.error('Ошибка при загрузке аватарки:', err);
    alert('Не удалось загрузить аватарку');
  }
}


// Функция загрузки фотографий
async function loadUserPhotos() {
  try {
    const response = await fetch('/api/user/photos', { credentials: 'include' });
    const photos = await response.json();

    if (!response.ok) throw new Error(photos.message || 'Ошибка загрузки фотографий');

    renderPhotos(photos);
  } catch (err) {
    console.error('Ошибка при загрузке фотографий:', err);
    document.getElementById('userPhotosGrid').innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-camera fa-3x mb-3 text-muted"></i>
        <p class="text-muted">Нет загруженных фотографий</p>
      </div>
    `;
  }


  const lazyImages = document.querySelectorAll('.lazy');
  if ('IntersectionObserver' in window) {
    const lazyImageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.classList.remove('lazy');
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(lazyImage => {
      lazyImageObserver.observe(lazyImage);
    });
  }

}

// Функция отрисовки фотографий
function renderPhotos(photos) {
  const container = document.getElementById('userPhotosGrid');

  if (!photos || photos.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-camera fa-3x mb-3 text-muted"></i>
        <p class="text-muted">Нет загруженных постов</p>
      </div>
    `;
    return;
  }

  let html = '';
  photos.forEach(photo => {
    html += `
      <div class="col-md-4 col-6 mb-3">
        <div class="photo-thumbnail">
          <img src="${photo.url}" class="img-fluid" alt="Фото">
          <div class="photo-overlay">
            <div class="photo-stats">
              <span><i class="fas fa-heart me-1"></i> ${photo.likes}</span>
              <span><i class="fas fa-comment me-1"></i> ${photo.comments}</span>
            </div>
            <button class="btn btn-sm btn-danger photo-action" data-photo-id="${photo.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Добавляем обработчики для кнопок удаления
  document.querySelectorAll('.photo-action').forEach(btn => {
    btn.addEventListener('click', function () {
      const photoId = this.dataset.photoId;
      deletePhoto(photoId);
    });
  });
}

// Функция удаления фотографии
async function deletePhoto(photoId) {
  if (!confirm('Вы уверены, что хотите удалить эту фотографию?')) return;

  try {
    const response = await fetch(`/api/photos/${photoId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Ошибка при удалении');

    // Перезагружаем фотографии
  } catch (err) {
    console.error('Ошибка при удалении фотографии:', err);
    alert('Не удалось удалить фотографию');
  }
}

// Вызываем загрузку фотографий при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // ... ваш существующий код ...

  // Добавьте эту строку в конец
  loadUserPhotos();

  // Обработчик кнопки "Показать еще"
  document.getElementById('loadMorePhotos')?.addEventListener('click', loadMorePhotos);
});

// Функция для загрузки дополнительных фотографий
async function loadMorePhotos() {
  const btn = document.getElementById('loadMorePhotos');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Загрузка...';

  try {
    // Здесь должен быть запрос к API для получения следующей страницы фотографий
    // Например: /api/user/photos?page=2
    // После получения добавляем новые фотографии к существующим
    // В этом примере просто перезагружаем все фотографии
    await loadUserPhotos();
  } finally {
    btn.disabled = false;
    btn.textContent = 'Показать еще';
  }
}