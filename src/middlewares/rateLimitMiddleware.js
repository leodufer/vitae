const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // límite de 20 peticiones por IP
    message: { error: 'Demasiados intentos. Por favor, intente de nuevo más tarde.' }
});

const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 100, // límite de 100 peticiones por IP
    message: { error: 'Límite de peticiones excedido.' }
});

module.exports = {
    authLimiter,
    apiLimiter
};
