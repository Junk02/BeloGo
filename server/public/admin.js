const serverUrl = 'http://localhost:3000';

async function getUsers() {
    try {
        const res = await fetch(`${serverUrl}/users`);
        const data = await res.json();
        document.getElementById('output').textContent = JSON.stringify(data, null, 2);
    } catch (err) {
        document.getElementById('output').textContent = 'Ошибка получения данных';
    }
}

async function deleteUsers() {
    if (!confirm('Точно очистить всех пользователей?')) return;

    try {
        const res = await fetch(`${serverUrl}/users`, { method: 'DELETE' });
        const data = await res.json();
        document.getElementById('output').textContent = JSON.stringify(data, null, 2);
    } catch (err) {
        document.getElementById('output').textContent = 'Ошибка удаления';
    }
}