const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 🔒 Check if token is blacklisted
        const [rows] = await db.query('SELECT * FROM blacklisted_tokens WHERE token = ?', [token]);
        if (rows.length > 0) {
            return res.status(401).json({ error: 'Token has been logged out' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret-key');
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;




exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: 'Authentication token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user; // This 'user' object from the JWT payload *should* contain the role
        next();
    });
};
