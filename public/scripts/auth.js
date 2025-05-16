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

function validateNickname(input) {
    const value = input.value.trim();
    if (value.length < 3) input.setCustomValidity('Никнейм должен быть не менее 3 символов.');
    else if (!/^[a-zA-Z0-9_]+$/.test(value)) input.setCustomValidity('Никнейм может содержать только латиницу, цифры и _ без пробелов.');
    else input.setCustomValidity('');
}

// Валидация + отправка регистрации
signupForm.addEventListener('submit', async event => {
    // кастомная валидация полей
    const nameInput = signupForm.querySelector('#nameInput');
    const nicknameInput = signupForm.querySelector('input[placeholder="Никнейм"]');
    const passwordFields = signupForm.querySelectorAll('input[type="password"]');

    validateName(nameInput);
    validateNickname(nicknameInput);
    validatePassword(passwordFields[0]);
    validateConfirmPassword(passwordFields[0], passwordFields[1]);

    if (!signupForm.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        signupForm.classList.add('was-validated');
        adjustHeight();
        return;
    }

    event.preventDefault();

    const name = nameInput.value.trim();
    const nickname = nicknameInput.value.trim();
    const password = passwordFields[0].value;

    try {
        // Регистрация
        const registerResponse = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, nickname, password })
        });

        const registerResult = await registerResponse.json();

        if (registerResponse.ok) {
            alert(registerResult.message);

            // Автоматический логин
            const loginResponse = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // важно, чтобы сессия сохранилась
                body: JSON.stringify({ nickname, password })
            });

            const loginResult = await loginResponse.json();

            if (loginResponse.ok) {
                // Очистка формы и переключение интерфейса
                signupForm.reset();
                signupForm.classList.remove('was-validated');
                container.classList.remove('show-signup');
                adjustHeight();

                // Перенаправление на профиль
                window.location.href = 'http://localhost:3000/pages/profile.html';
            } else {
                alert('Ошибка авторизации после регистрации: ' + loginResult.message);
            }
        } else {
            alert('Ошибка регистрации: ' + registerResult.message);
        }
    } catch (err) {
        console.error(err);
        alert('Не удалось соединиться с сервером.');
    }
});


// Валидация + отправка авторизации
signinForm.addEventListener('submit', async event => {
    const nicknameInput = signinForm.querySelector('input[placeholder="Никнейм"]');
    const passwordInput = signinForm.querySelector('input[placeholder="Пароль"]');

    validateNickname(nicknameInput);
    validatePassword(passwordInput);

    if (!signinForm.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        signinForm.classList.add('was-validated');
        adjustHeight();
        return;
    }

    event.preventDefault();

    const nickname = nicknameInput.value.trim();
    const password = passwordInput.value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname, password }),
        });
        const result = await response.json();

        if (response.ok) {
            //alert(`Добро пожаловать, ${result.user.name}! Авторизация успешна.`);
            window.location.href = '/pages/profile.html'; // путь до страницы профиля

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
document.querySelectorAll('input[placeholder="Никнейм"]').forEach(input =>
    input.addEventListener('input', () => {
        validateNickname(input);
        adjustHeight();
    })
);
