const db = require('../config/db');

const apiTracker = async (req, res, next) => {
    try {
        const userId = req.user?.id; // user should be available via authMiddleware
        const endpoint = req.originalUrl.split('?')[0]; // clean URL
        const method = req.method;

        if (!userId) {
            return next(); // Only track logged in users
        }

        // Check if record already exists
        const [rows] = await db.query(
            'SELECT id, count FROM api_usage WHERE user_id = ? AND endpoint = ? AND method = ?',
            [userId, endpoint, method]
        );

        if (rows.length > 0) {
            // Increment existing count
            await db.query(
                'UPDATE api_usage SET count = count + 1, last_accessed = NOW() WHERE id = ?',
                [rows[0].id]
            );
        } else {
            // Create new record
            await db.query(
                'INSERT INTO api_usage (user_id, endpoint, method) VALUES (?, ?, ?)',
                [userId, endpoint, method]
            );
        }

        next();
    } catch (error) {
        console.error("API Tracker Error:", error);
        next(); // Don't block the request if tracking fails
    }
};

module.exports = apiTracker;
