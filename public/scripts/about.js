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