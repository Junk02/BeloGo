
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json()); // Чтобы читать JSON из тела запроса
app.use(express.urlencoded({ extended: true })); // Чтобы читать form-data

// Пример маршрута
app.get('/', (req, res) => {
    res.send('Сервер работает!');
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
