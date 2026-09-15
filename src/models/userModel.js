const pool = require('../config/db');

const userModel = {
    async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0] || null;
    },

    async findById(id) {
        const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async create({ name, email, password }) {
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, password]
        );
        return { id: result.insertId, name, email };
    },

    async saveResetToken(id, token, expires) {
        await pool.query(
            'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
            [token, expires, id]
        );
    },

    async findByValidResetToken(token) {
        const [rows] = await pool.query(
            'SELECT id, name, email FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
            [token]
        );
        return rows[0] || null;
    },

    async updatePasswordAndClearReset(id, hashedPassword) {
        await pool.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
            [hashedPassword, id]
        );
    },

    async checkResetTokenColumn() {
        const [columns] = await pool.query("SHOW COLUMNS FROM users LIKE 'reset_token'");
        return columns.length > 0;
    },

    async addResetTokenColumns() {
        await pool.query(
            "ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL, ADD COLUMN reset_token_expires TIMESTAMP NULL"
        );
    }
};

module.exports = userModel;
