const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Token no proporcionado.' });
    }

    if (!JWT_SECRET || JWT_SECRET === 'supersecretkey_change_me') {
        console.warn('WARNING: JWT_SECRET is not set properly or using default value.');
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido o expirado.' });
        }
        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;
