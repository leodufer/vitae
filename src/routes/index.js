const express = require('express');
const router = express.Router();
const { apiLimiter } = require('../middlewares/rateLimitMiddleware');
const authRoutes = require('./authRoutes');
const cvRoutes = require('./cvRoutes');
const statusRoutes = require('./statusRoutes');

// Limitador de tasa general para la API
router.use(apiLimiter);

// Montaje de rutas
router.use('/', authRoutes);
router.use('/cv', cvRoutes);
router.use('/', statusRoutes);

module.exports = router;
