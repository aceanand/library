const db = require('../config/db');



exports.addBook = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const {
            title, author, genre, published_date, summary, isbn, pages, publisher,
            language, edition, format, price, rating, stock_quantity,
            dimensions, weight, reviews, editor, cover_image_url = ''
        } = req.body;

        // Required fields
        const requiredFields = {
            title,
            author,
            genre,
            isbn,
            published_date,
            publisher,
            language,
            stock_quantity,
            price
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => value === undefined || value === null || value === '')
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Missing required book fields: ${missingFields.join(', ')}`
            });
        }

        const [result] = await db.query(`
            INSERT INTO books (
                title, author, genre, published_date, summary, isbn, pages, publisher,
                language, cover_image_url, edition, format, price, rating, stock_quantity,
                dimensions, weight, reviews, editor, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            title, author, genre, published_date, summary, isbn, pages, publisher,
            language, cover_image_url, edition, format, price, rating, stock_quantity,
            dimensions, weight, reviews, editor
        ]);

        const [newBookRows] = await db.query('SELECT * FROM books WHERE id = ?', [result.insertId]);
        res.status(201).json({ message: 'Book added successfully', book: newBookRows[0] });

    } catch (error) {
        console.error('Add book error:', error);
        res.status(500).json({ error: 'Failed to add book', details: error.message });
    }
};


exports.getBooks = async (req, res) => {
    try {
        const { page = 1, limit = 10, author, genre } = req.query;
        const offset = (page - 1) * limit;

        let baseQuery = 'SELECT * FROM books WHERE 1=1';
        const params = [];

        if (author) {
            baseQuery += ' AND author LIKE ?';
            params.push(`%${author}%`);
        }

        if (genre) {
            baseQuery += ' AND genre = ?';
            params.push(genre);
        }

        baseQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [books] = await db.query(baseQuery, params);
        res.json({ books });
    } catch (err) {
        console.error('Get books error:', err);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
};

exports.getBookDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const [[book]] = await db.query('SELECT * FROM books WHERE id = ?', [id]);
        if (!book) return res.status(404).json({ error: 'Book not found' });

        const [[ratingRow]] = await db.query(
            'SELECT AVG(rating) as avg_rating FROM reviews WHERE book_id = ?',
            [id]
        );

        const { page = 1, limit = 5 } = req.query;
        const offset = (page - 1) * limit;

        const [reviews] = await db.query(
            'SELECT * FROM reviews WHERE book_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [id, parseInt(limit), parseInt(offset)]
        );

        res.json({
            book,
            average_rating: ratingRow.avg_rating || 0,
            reviews
        });
    } catch (err) {
        console.error('Get book details error:', err);
        res.status(500).json({ error: 'Failed to fetch book details' });
    }
};

exports.searchBooks = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: 'Search query is required' });

        const searchTerm = `%${q.toLowerCase()}%`;

        const [books] = await db.query(
            `SELECT * FROM books WHERE LOWER(title) LIKE ? OR LOWER(author) LIKE ?`,
            [searchTerm, searchTerm]
        );

        res.json({ books });
    } catch (err) {
        console.error('Search books error:', err);
        res.status(500).json({ error: 'Failed to search books' });
    }
};
