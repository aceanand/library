const db = require('../config/db');
const jwt = require('jsonwebtoken');
exports.signup = async (req, res) => {
    try {
        const { country_code, mobile, first_name = '', last_name = '', email = '' } = req.body;

        // Basic validation
        if (!country_code || !mobile) {
            return res.status(400).json({ error: 'Country code and mobile are required' });
        }

        // Validate email format if provided
        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if user already exists
        const [existingUsers] = await db.query(
            'SELECT * FROM users WHERE country_code = ? AND mobile = ?',
            [country_code, mobile]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'User already exists. Please login.' });
        }

        // Create new user (excluding role)
        const [result] = await db.query(`
            INSERT INTO users (country_code, mobile,  created_at, first_name, last_name, email, is_deleted_count)
            VALUES (?, ?, NOW(), ?, ?, ?, 0)
        `, [country_code, mobile, first_name, last_name, email]);

        const [newUserRows] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
        const user = newUserRows[0];

        const token = jwt.sign(
            { id: user.id, mobile: user.mobile },
            process.env.JWT_SECRET || 'your-fallback-secret-key',
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Signup successful',
            token,
            user: {
                id: user.id,
                name: `${user.first_name} ${user.last_name}`.trim(),
                mobile: user.mobile,
                country_code: user.country_code,
                email: user.email,
                subscription: user.subscription
            }
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Signup failed", details: error.message });
    }
};
exports.login = async (req, res) => {
    try {
        const { country_code, mobile } = req.body;

        if (!country_code || !mobile) {
            return res.status(400).json({ error: 'Country code and mobile are required' });
        }

        const [users] = await db.query('SELECT * FROM users WHERE country_code = ? AND mobile = ?', [country_code, mobile]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found. Please sign up first.' });
        }

        const user = users[0];

        await db.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

        const token = jwt.sign(
            { id: user.id, mobile: user.mobile },
            process.env.JWT_SECRET || 'your-fallback-secret-key',
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.first_name + ' ' + user.last_name,
                mobile: user.mobile,
                country_code: user.country_code,
                email: user.email,
                subscription: user.subscription,
                last_login_at: user.last_login_at,
                is_deleted_count: user.is_deleted_count,
                deleted_at: user.deleted_at
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed", details: error.message });
    }
};