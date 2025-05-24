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
    const response = await fetch('/delete-account', {
      method: 'POST',
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Ошибка при удалении аккаунта');

    alert('Аккаунт успешно удалён.');
    window.location.href = '/pages/auth.html';
  } catch (err) {
    console.error('Ошибка при удалении аккаунта:', err);
    alert('Не удалось удалить аккаунт. Попробуйте позже.');
  }
}