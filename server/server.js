const express = require('express');
const session = require('express-session');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
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

//db.run(`ALTER TABLE users ADD COLUMN bio TEXT DEFAULT ''`); // Для информации о пользователе
//db.run(`ALTER TABLE users ADD COLUMN avatar TEXT`); // Для аватарок


db.run(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id)
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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../public/uploads/'); // папка для фото
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../public/avatars/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});
const uploadAvatar = multer({ storage: avatarStorage });


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


// Добавление аватарки
app.post('/upload-avatar', uploadAvatar.single('avatar'), (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Не авторизован' });
    }

    const userId = req.session.user.id;
    const newAvatar = '/avatars/' + req.file.filename;

    // Получим старую аватарку
    db.get('SELECT avatar FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) return res.status(500).json({ message: 'Ошибка при получении текущей аватарки' });

        // Удалим старую, если была и не загружена с внешнего URL
        if (row?.avatar && row.avatar.startsWith('/avatars/')) {
            const oldPath = path.join(__dirname, '../public', row.avatar);
            fs.unlink(oldPath, err => {
                if (err) console.warn('Не удалось удалить старую аватарку:', err.message);
            });
        }

        // Обновим в базе
        db.run('UPDATE users SET avatar = ? WHERE id = ?', [newAvatar, userId], function (err) {
            if (err) return res.status(500).json({ message: 'Ошибка при обновлении аватарки' });

            // Обновим в сессии
            req.session.user.avatar = newAvatar;

            res.json({ avatar: newAvatar });
        });
    });
});



// Получение постов для ленты и карты
app.get('/api/posts', (req, res) => {
    const sql = `
        SELECT posts.id AS post_id,
               posts.title,
               posts.description,
               posts.latitude,
               posts.longitude,
               posts.created_at,
               posts.user_id,
               users.name AS author_name,
               users.nickname AS author_nickname,
               users.avatar AS author_avatar,
               photos.filename
        FROM posts
        LEFT JOIN users ON posts.user_id = users.id
        LEFT JOIN photos ON posts.id = photos.post_id
        ORDER BY posts.created_at DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Ошибка при получении постов' });
        }

        // Группируем фотки по постам
        const postsMap = {};
        rows.forEach(row => {
            if (!postsMap[row.post_id]) {
                postsMap[row.post_id] = {
                    id: row.post_id,
                    title: row.title,
                    description: row.description,
                    latitude: row.latitude,
                    longitude: row.longitude,
                    created_at: row.created_at,
                    author: {
                        id: row.user_id,
                        name: row.author_name,
                        nickname: row.author_nickname,
                        avatar: row.author_avatar || '/img/default-avatar.jpg'
                    },
                    photos: []
                };
            }
            if (row.filename) {
                postsMap[row.post_id].photos.push('/uploads/' + row.filename);
            }
        });

        const posts = Object.values(postsMap);
        res.json(posts);
    });
});




// Добавление поста
app.post('/upload-post', upload.array('images', 5), (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Не авторизован' });
    }

    const { title, description, latitude, longitude } = req.body;
    const images = req.files;

    if (!title || images.length === 0) {
        return res.status(400).json({ message: 'Нужно указать название и добавить хотя бы одно фото' });
    }

    // Сохраняем пост
    const insertPost = `INSERT INTO posts (user_id, title, description, latitude, longitude) VALUES (?, ?, ?, ?, ?)`;
    db.run(insertPost, [req.session.user.id, title, description, latitude, longitude], function (err) {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при создании поста' });
        }

        const postId = this.lastID;
        const insertPhoto = db.prepare(`INSERT INTO photos (post_id, filename) VALUES (?, ?)`);
        for (const file of images) {
            insertPhoto.run(postId, file.filename);
        }
        insertPhoto.finalize();
        res.status(201).json({ message: 'Пост успешно добавлен!' });
    });
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
                    nickname: user.nickname,
                    bio: user.bio || ''
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

    const sql = `SELECT id, name, nickname, bio, avatar FROM users WHERE id = ?`;
    db.get(sql, [req.session.user.id], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при получении профиля' });
        }

        res.json({ user });
    });
});


// Изменение информации о пользователе
app.post('/profile/update', (req, res) => {
    console.log('Сессия:', req.session);
    if (!req.session.user) {
        return res.status(401).json({ message: 'Не авторизован' });
    }

    const { name, bio } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Имя не может быть пустым' });
    }

    console.log('Получено:', name, bio);


    const sql = `UPDATE users SET name = ?, bio = ? WHERE id = ?`;
    db.run(sql, [name, bio || '', req.session.user.id], function (err) {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при обновлении профиля' });
        }

        // Обновляем данные в сессии
        req.session.user.name = name;
        req.session.user.bio = bio;

        res.json({ name, bio });
    });
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
    db.all('SELECT id, name, nickname, bio, password FROM users', (err, rows) => {
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

// Удаление аккаунта
app.post('/delete-account', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Не авторизован' });
    }

    const userId = req.session.user.id;

    db.serialize(() => {
        // Получаем аватарку
        db.get('SELECT avatar FROM users WHERE id = ?', [userId], (err, userRow) => {
            if (err) return res.status(500).json({ message: 'Ошибка при получении аватарки' });

            if (userRow?.avatar && userRow.avatar.startsWith('/avatars/')) {
                const avatarPath = path.join(__dirname, '../public', userRow.avatar);
                fs.unlink(avatarPath, err => {
                    if (err) console.warn('Не удалось удалить аватарку:', err.message);
                });
            }

            // Получаем все фото постов пользователя
            db.all(`
                SELECT filename FROM photos
                WHERE post_id IN (SELECT id FROM posts WHERE user_id = ?)
            `, [userId], (err, photoRows) => {
                if (err) return res.status(500).json({ message: 'Ошибка при получении фотографий' });

                // Удаляем файлы с диска
                photoRows.forEach(row => {
                    const photoPath = path.join(__dirname, '../public/uploads', row.filename);
                    fs.unlink(photoPath, err => {
                        if (err) console.warn('Не удалось удалить фото:', err.message);
                    });
                });

                // Удаляем записи из базы
                db.run(`DELETE FROM photos WHERE post_id IN (SELECT id FROM posts WHERE user_id = ?)`, [userId], function (err) {
                    if (err) return res.status(500).json({ message: 'Ошибка при удалении фотографий' });

                    db.run(`DELETE FROM posts WHERE user_id = ?`, [userId], function (err) {
                        if (err) return res.status(500).json({ message: 'Ошибка при удалении постов' });

                        db.run(`DELETE FROM users WHERE id = ?`, [userId], function (err) {
                            if (err) return res.status(500).json({ message: 'Ошибка при удалении пользователя' });

                            req.session.destroy(err => {
                                if (err) return res.status(500).json({ message: 'Ошибка при завершении сессии' });

                                res.clearCookie('connect.sid');
                                return res.json({ message: 'Аккаунт и все связанные данные удалены' });
                            });
                        });
                    });
                });
            });
        });
    });
});


// Запуск сервера
app.listen(PORT, () => {
    log(`Сервер запущен на http://localhost:${PORT}`);
});
