const db = require('../config/db');
const jwt = require('jsonwebtoken');
// const libphonenumber = require('google-libphonenumber').PhoneNumberUtil.getInstance();
// const PNF = require('google-libphonenumber').PhoneNumberFormat;
// Signup
exports.signupWithMobile = async (req, res) => {
    try {
        const { country_code, mobile, first_name = '', last_name = '', email = '', role } = req.body;

        // Basic validation
        if (!country_code || !mobile || !role) {
            return res.status(400).json({ error: 'Country code, mobile, and role are required' });
        }

        // Validate email format if provided
        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate role to be either 'Author' or 'Genre'
        const allowedRoles = ['Author', 'Genre'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role provided. Role must be "Author" or "Genre".' });
        }

        // Check if user already exists
        const [existingUsers] = await db.query(
            'SELECT * FROM users WHERE country_code = ? AND mobile = ?',
            [country_code, mobile]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'User already exists. Please login.' });
        }

        // Create new user with email and role
        const [result] = await db.query(`
            INSERT INTO users (country_code, mobile, profile_type, created_at, first_name, last_name, email, is_deleted_count, role)
            VALUES (?, ?, 'Individual', NOW(), ?, ?, ?, 0, ?)
        `, [country_code, mobile, first_name, last_name, email, role]);

        // Fetch the newly created user
        const [newUserRows] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
        const user = newUserRows[0];

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, mobile: user.mobile, role: user.role },
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
                subscription: user.subscription,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Signup failed", details: error.message });
    }
};

// Login
exports.loginWithMobile = async (req, res) => {
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

        // Update login timestamp
        await db.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

        // Generate JWT token
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



exports.logoutUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(400).json({ error: "No token provided" });
        }

        // Insert token into blacklist
        await db.query('INSERT INTO blacklisted_tokens (token) VALUES (?)', [token]);

        res.json({ message: "Logout successful" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Logout failed", details: error.message });
    }
};

// ✅ Delete Account
exports.deleteAccount = async (req, res) => {
    try {
        const { country_code, mobile, delete_reason } = req.body;

        if (!country_code || !mobile) {
            return res.status(400).json({ error: 'Country code and mobile are required' });
        }

        // Step 1: Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE country_code = ? AND mobile = ?', [country_code, mobile]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        // Step 2: Log the deletion reason
        await db.query(`
            INSERT INTO user_deletion_logs (user_id, mobile, reason, deleted_at) 
            VALUES (?, ?, ?, NOW()) 
        `, [user.id, mobile, delete_reason]);

        // Step 3: Delete related rows in the user_stage table first
        await db.query('DELETE FROM user_stage WHERE user_id = ?', [user.id]);

        // Step 4: Permanently delete the user's account from the users table
        await db.query('DELETE FROM users WHERE id = ?', [user.id]);

        // Return a success response
        res.json({ message: 'Account deleted successfully' });

    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ error: "Account deletion failed", details: error.message });
    }
};

// ✅ Api Usage
exports.getApiUsage = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT endpoint, method, count, last_accessed FROM api_usage WHERE user_id = ? ORDER BY count DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        console.error("API Usage Error:", error);
        res.status(500).json({ error: "Failed to fetch API usage data", details: error.message });
    }
};


