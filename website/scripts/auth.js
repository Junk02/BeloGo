const container = document.getElementById('authContainer');
const signinForm = document.getElementById('signinForm');
const signupForm = document.getElementById('signupForm');

// Функция установки высоты контейнера под активную форму
function adjustHeight() {
    const activeForm = container.classList.contains('show-signup') ? signupForm : signinForm;
    container.style.height = activeForm.scrollHeight + 'px';
}

// Изначальная подстройка высоты
window.addEventListener('DOMContentLoaded', adjustHeight);

document.getElementById('showSignup').addEventListener('click', e => {
    e.preventDefault();
    container.classList.add('show-signup');
    adjustHeight();
});

document.getElementById('showSignin').addEventListener('click', e => {
    e.preventDefault();
    container.classList.remove('show-signup');
    adjustHeight();
});

// HTML5 валидация с подстройкой высоты после проверки
document.querySelectorAll('.needs-validation').forEach(form => {
    form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }
        form.classList.add('was-validated');
        adjustHeight();
    }, false);
});