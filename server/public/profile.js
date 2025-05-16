async function loadProfile() {
    try {
        const response = await fetch('http://localhost:3000/profile', {
            credentials: 'include'
        });
        const data = await response.json();

        if (!response.ok || !data.user) {
            window.location.href = '/auth/auth.html';
            return;
        }

        document.getElementById('welcome').textContent = `Добро пожаловать, ${data.user.name}!`;
        document.getElementById('info').textContent = `Ваш никнейм: ${data.user.nickname}`;
    } catch (err) {
        alert('Ошибка при получении данных. Перенаправление на вход.');
        window.location.href = '/auth/auth.html';
    }
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch('http://localhost:3000/logout', {
        method: 'POST',
        credentials: 'include'
    });
    window.location.href = '/auth/auth.html';
});

loadProfile();