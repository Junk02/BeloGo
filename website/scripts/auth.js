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

// Кастомная валидация поля пароля (например: min 8 символов, без < и >)
function validatePassword(input) {
    const value = input.value.trim();
    const invalidChars = /[<>]/;

    if (value.length < 8) {
        input.setCustomValidity('Пароль должен быть не менее 8 символов.');
    } else if (invalidChars.test(value)) {
        input.setCustomValidity('Пароль не должен содержать < и >.');
    } else {
        input.setCustomValidity('');
    }
}

// Кастомная валидация поля имени (только английские или русские буквы)
function validateName(input) {
    const value = input.value.trim();
    const onlyLetters = /^[A-Za-zА-Яа-яЁё]+$/;

    if (!onlyLetters.test(value)) {
        input.setCustomValidity('Имя должно содержать только буквы без пробелов.');
    } else {
        input.setCustomValidity('');
    }
}

// Проверяет совпадение паролей
function validateConfirmPassword(passwordInput, confirmInput) {
    if (confirmInput.value !== passwordInput.value) {
        confirmInput.setCustomValidity('Пароли не совпадают.');
    } else {
        confirmInput.setCustomValidity('');
    }
}

// Подключаем к каждой форме кастомную валидацию
document.querySelectorAll('.needs-validation').forEach(form => {
    form.addEventListener('submit', event => {
        const passwordFields = form.querySelectorAll('input[type="password"]');
        if (passwordFields.length >= 1) {
            validatePassword(passwordFields[0]);
        }
        if (passwordFields.length === 2) {
            validateConfirmPassword(passwordFields[0], passwordFields[1]);
        }

        const nameInput = form.querySelector('#nameInput');
        if (nameInput) {
            validateName(nameInput);
        }


        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }

        form.classList.add('was-validated');
        adjustHeight();
    }, false);
});

// Если хочешь валидировать сразу при вводе
document.querySelectorAll('input[type="password"]').forEach(input => {
    input.addEventListener('input', () => {
        validatePassword(input);
        adjustHeight(); // чтобы ошибки учитывались в высоте
    });
});

// Листенер на поле повтора пароля для сравнения
document.querySelectorAll('#signupForm input[type="password"]').forEach(input => {
    input.addEventListener('input', () => {
        const form = document.getElementById('signupForm');
        const [passwordInput, confirmInput] = form.querySelectorAll('input[type="password"]');
        validatePassword(passwordInput);
        validateConfirmPassword(passwordInput, confirmInput);
        adjustHeight();
    });
});


if (nameInputLive) {
    nameInputLive.addEventListener('input', () => {
        validateName(nameInputLive);
        adjustHeight();
    });
}


