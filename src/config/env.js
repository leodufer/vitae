require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'VV/T/n1zCSOUqPBtBbI4+Ub/NYnHvA8FP9WPSM8QKF4=',
    DB: {
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'vitae_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    }
};
