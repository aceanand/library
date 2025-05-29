const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test Connection
(async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ MySQL Connected');
        connection.release();
    } catch (err) {
        console.error('Database Connection Failed:', err);
    }
})();

module.exports = db;