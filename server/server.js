const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db');
const app = express();
const PORT = 3000;
const time = new Date();

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    nickname TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`);


app.use(cors({
  origin: 'http://localhost:3000', // замени на свой порт, если другой
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
// Настройка сессий
app.use(session({
    secret: 'my_secret_key',      // поменяйте на настоящую переменную окружения!
    resave: false,                // не сохранять сессию, если ничего не изменилось
    saveUninitialized: false,     // не создавать сессию для анонимных пользователей
    cookie: {
        secure: false,              // true — только по HTTPS
        httpOnly: true,             // JS на фронте не сможет читать cookie
        maxAge: 24 * 60 * 60 * 1000 // время жизни куки: 1 день
    }
}));

const red = '\x1b[31m';
const green = '\x1b[32m';
const reset = '\x1b[0m';

function log(text, type = 'def') {
    if (type == 'def') console.log((`[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] ${text}`));
    else if (type == 'err') console.log(red + (`[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] ${text}` + reset));
    else if (type == 'suc') console.log(green + (`[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] ${text}` + reset));
}

app.get('/', (req, res) => {
    res.send('Сервер работает!');
});

// Проверка сессии
app.get('/api/check-session', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ loggedIn: true, username: req.session.user.username });
    } else {
        res.json({ loggedIn: false });
    }
});


app.post('/register', async (req, res) => {
    const { name, nickname, password } = req.body;
    log('Client data:');
    log(`${JSON.stringify({ name, nickname, password })}`);

    if (!name || !nickname || !password) {
        return res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
    }

    // Валидация имени: только буквы (русские или английские)
    const nameRegex = /^[A-Za-zА-Яа-яЁё]+$/;
    if (!nameRegex.test(name)) {
        return res.status(400).json({ message: 'Имя может содержать только буквы' });
    }

    // Валидация никнейма: латинские буквы, цифры, подчёркивания, минимум 3 символа
    const nicknameRegex = /^[a-zA-Z0-9_]{3,}$/;
    if (!nicknameRegex.test(nickname)) {
        return res.status(400).json({ message: 'Никнейм должен содержать минимум 3 латинских символа и не содержать пробелов' });
    }

    // Валидация пароля
    if (password.length < 8 || /[<>]/.test(password)) {
        return res.status(400).json({ message: 'Пароль должен быть не менее 8 символов и не содержать < и >' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        log(`User password hash: ${hashedPassword}`);

        const sql = `INSERT INTO users (name, nickname, password) VALUES (?, ?, ?)`;
        db.run(sql, [name, nickname, hashedPassword], function (err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    log('User with such an ID already exist', 'err');
                    return res.status(409).json({ message: 'Пользователь с таким никнеймом уже существует' });
                }
                return res.status(500).json({ message: 'Ошибка при сохранении пользователя' });
            }

            log(`User added with ID ${this.lastID}`);
            res.status(201).json({
                message: 'Регистрация прошла успешно!',
                user: { name, nickname }
            });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Ошибка при хешировании пароля' });
    }

});

app.post('/login', (req, res) => {
    const { nickname, password } = req.body;

    if (!nickname || !password) {
        return res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
    }

    // Ищем пользователя в базе по никнейму
    const sql = `SELECT * FROM users WHERE nickname = ?`;
    db.get(sql, [nickname], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при поиске пользователя' });
        }

        if (!user) {
            log(`User ${nickname} doesn't exist`, 'err');
            return res.status(401).json({ message: 'Неверный никнейм или пароль' });
        }

        // Сравниваем пароль с хешем
        try {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                log(`User ${nickname} registered successfully`, 'suc');
                // Сохраняем данные в сессии
                req.session.user = {
                    id: user.id,
                    name: user.name,
                    nickname: user.nickname
                };

                // И возвращаем клиенту:
                return res.json({
                    message: 'Авторизация успешна!',
                    user: req.session.user
                });

            } else {
                log(`User ${nickname} registered unsuccessfully`, 'err');
                return res.status(401).json({ message: 'Неверный никнейм или пароль' });
            }
        } catch {
            return res.status(500).json({ message: 'Ошибка при проверке пароля' });
        }
    });
});

// Получение профиля пользователя (сессии)
app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Не авторизован' });
  }
  // Иначе возвращаем информацию о пользователе:
  res.json({ user: req.session.user });
});

// Выход из профиля (сессии)
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Ошибка при выходе' });
    res.clearCookie('connect.sid'); // имя куки по умолчанию
    res.json({ message: 'Вы успешно вышли' });
  });
});



// Получение всех пользователей (админ панель)
app.get('/users', (req, res) => {
    db.all('SELECT id, name, nickname, password FROM users', (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при получении пользователей' });
        }
        res.json(rows);
    });
});

// Очистка базы (админ панель)
app.delete('/users', (req, res) => {
    db.run('DELETE FROM users', function (err) {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при очистке базы данных' });
        }
        res.json({ message: `Удалено пользователей: ${this.changes}` });
    });
});

// Запуск сервера
app.listen(PORT, () => {
    log(`Сервер запущен на http://localhost:${PORT}`);
});
