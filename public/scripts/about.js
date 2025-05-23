function animateOnScroll() {
    const elements = document.querySelectorAll('.scroll-animate, .team-card, .team-img, .stats-item, .timeline-item, .img-fluid');

    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const screenPosition = window.innerHeight / 1.2;

        if (elementPosition < screenPosition && elementBottom > 0) {
            element.classList.add('animated');
            element.classList.remove('hide-animate');
        } else {
            element.classList.remove('animated');
            element.classList.add('hide-animate');
        }
    });
}

// Анимация счетчиков
function animateCounters() {
    const counters = document.querySelectorAll('.stats-number');
    const speed = 200;

    counters.forEach(counter => {
        const target = +counter.getAttribute('data-count');
        const count = +counter.innerText;
        const increment = target / speed;

        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(animateCounters, 1);
        } else {
            counter.innerText = target;
        }
    });
}

// Запуск анимации счетчиков при попадании в область видимости
function checkCounters() {
    const countersSection = document.querySelector('.stats-item');
    if (!countersSection) return;

    const countersPosition = countersSection.getBoundingClientRect().top;
    const screenPosition = window.innerHeight / 1.2;

    if (countersPosition < screenPosition) {
        animateCounters();
        window.removeEventListener('scroll', checkCounters);
    }
}

// Инициализация
window.addEventListener('load', () => {
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);
    window.addEventListener('scroll', checkCounters);
});

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
});

document.getElementById('feedback-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // Показываем индикатор загрузки
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Отправка...';
    
    const formData = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        subject: form.subject.value.trim(),
        message: form.message.value.trim()
    };

    
        
    fetch('/send-feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
        // document.getElementById('feedback-status').textContent = data.message;
	showToast('Успех!', 'Ваше сообщение успешно отправлено!', 'success');
        form.reset();
    })
    .catch(err => {
        console.error('Ошибка:', err);
	showToast('Ошибка!', 'Не удалось отправить сообщение. Попробуйте позже.', 'danger');
        //document.getElementById('feedback-status').textContent = 'Произошла ошибка при отправке';
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    });
});

// Функция показа уведомления
function showToast(title, message, type = 'success') {
    const toastEl = document.getElementById('feedbackToast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    
    // Устанавливаем заголовок и сообщение
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Меняем стиль в зависимости от типа
    const toastHeader = toastEl.querySelector('.toast-header');
    toastHeader.className = 'toast-header';
    
    if (type === 'success') {
        toastHeader.classList.add('bg-success', 'text-white');
    } else if (type === 'danger') {
        toastHeader.classList.add('bg-danger', 'text-white');
    } else {
        toastHeader.classList.add('bg-primary', 'text-white');
    }
    
    // Показываем toast с анимацией
    const toast = new bootstrap.Toast(toastEl, {
        animation: true,
        autohide: true,
        delay: 5000
    });
    toast.show();
    
    // Добавляем анимацию для появления
    toastEl.classList.add('animate__animated', 'animate__fadeInUp');
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.classList.remove('animate__animated', 'animate__fadeInUp');
    });
}

