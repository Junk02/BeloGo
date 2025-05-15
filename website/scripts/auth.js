const container = document.getElementById('authContainer');
const signinForm = document.getElementById('signinForm');
const signupForm = document.getElementById('signupForm');
const nameInputLive = document.querySelector('#nameInput');

// Подстройка высоты формы
function adjustHeight() {
    const activeForm = container.classList.contains('show-signup') ? signupForm : signinForm;
    container.style.height = activeForm.scrollHeight + 'px';
}

window.addEventListener('DOMContentLoaded', adjustHeight);

// Переключение форм
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

// Валидации
function validatePassword(input) {
    const value = input.value.trim();
    if (value.length < 8) input.setCustomValidity('Пароль должен быть не менее 8 символов.');
    else if (/[<>]/.test(value)) input.setCustomValidity('Пароль не должен содержать < и >.');
    else input.setCustomValidity('');
}
function validateName(input) {
    const value = input.value.trim();
    if (!/^[A-Za-zА-Яа-яЁё]+$/.test(value)) input.setCustomValidity('Имя должно быть только буквы без пробелов.');
    else input.setCustomValidity('');
}
function validateConfirmPassword(pw, confirm) {
    if (confirm.value !== pw.value) confirm.setCustomValidity('Пароли не совпадают.');
    else confirm.setCustomValidity('');
}

// Валидация + отправка регистрации
signupForm.addEventListener('submit', async event => {
    // сначала стандартная валидация полей
    const passwordFields = signupForm.querySelectorAll('input[type="password"]');
    validatePassword(passwordFields[0]);
    validateConfirmPassword(passwordFields[0], passwordFields[1]);
    validateName(signupForm.querySelector('#nameInput'));

    if (!signupForm.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        signupForm.classList.add('was-validated');
        adjustHeight();
        return;
    }

    // если прошли валидацию, блокируем дефолт
    event.preventDefault();

    // собираем данные
    const name = signupForm.querySelector('input[placeholder="Имя"]').value.trim();
    const nickname = signupForm.querySelector('input[placeholder="Никнейм"]').value.trim();
    const password = passwordFields[0].value;

    try {
        // отправляем на сервер
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, nickname, password })
        });
        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            signupForm.reset();
            signupForm.classList.remove('was-validated');
            container.classList.remove('show-signup');
            adjustHeight();
        } else {
            alert('Ошибка: ' + result.message);
        }
    } catch (err) {
        console.error(err);
        alert('Не удалось соединиться с сервером.');
    }
});

// Валидация на лету и подстройка высоты
document.querySelectorAll('input[type="password"]').forEach(input =>
    input.addEventListener('input', () => {
        validatePassword(input);
        adjustHeight();
    })
);
if (nameInputLive) {
    nameInputLive.addEventListener('input', () => {
        validateName(nameInputLive);
        adjustHeight();
    });
}
