// Пример обработчика API для получения постов
app.get('/api/posts', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const offset = (page - 1) * limit;

        // Запрос к базе данных
        const posts = await db.query(`
            SELECT p.*, 
                   (SELECT array_agg(i.url) 
                    FROM images i 
                    WHERE i.post_id = p.id) as images
            FROM posts p
            ORDER BY p.created_at DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        // Преобразование результатов
        const result = posts.rows.map(post => ({
            ...post,
            images: post.images.map(url => ({ url }))
        }));

        res.json({
            success: true,
            posts: result
        });
    } catch (error) {
        console.error('Ошибка при получении постов:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
});