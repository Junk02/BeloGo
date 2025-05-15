const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database('./users.db');
const app = express();
const PORT = 3000;

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    nickname TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`);


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('Сервер работает!');
});

app.post('/register', (req, res) => {
    const { name, nickname, password } = req.body;
    console.log('Client data:');
    console.log({ name, nickname, password });

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

    // (Позже можно будет добавить проверку на уже существующий ник)

    // Добавляем пользователя в базу
    const sql = `INSERT INTO users (name, nickname, password) VALUES (?, ?, ?)`;
    db.run(sql, [name, nickname, password], function (err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                console.log('User with such an ID already exist');
                return res.status(409).json({ message: 'Пользователь с таким никнеймом уже существует' });
            }
            return res.status(500).json({ message: 'Ошибка при сохранении пользователя' });
        }

        console.log(`User added with ID ${this.lastID}`);
        res.status(201).json({
            message: 'Регистрация прошла успешно!',
            user: { name, nickname }
        });
    });

});

// Получение всех пользователей (админ панель)
app.get('/users', (req, res) => {
  db.all('SELECT id, name, nickname FROM users', (err, rows) => {
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
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
