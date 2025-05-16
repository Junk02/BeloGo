// Анимация при скролле
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if(elementPosition < screenPosition) {
            const animation = element.getAttribute('data-animation');
            const delay = element.getAttribute('data-animation-delay') || 0;
            
            element.style.animationDelay = delay + 'ms';
            element.classList.add(animation);
            element.classList.add('animate__animated');
            element.style.opacity = '1';
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
        
        if(count < target) {
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
    const countersPosition = countersSection.getBoundingClientRect().top;
    const screenPosition = window.innerHeight / 1.2;
    
    if(countersPosition < screenPosition) {
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