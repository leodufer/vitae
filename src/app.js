const express = require('express');
const path = require('path');
const helmet = require('helmet');
const apiRoutes = require('./routes');

const app = express();

// Seguridad: Cabeceras HTTP con Helmet
app.use(helmet({
    contentSecurityPolicy: false,
}));

// Middleware para parsear cuerpos de peticiones en JSON
app.use(express.json());

// Archivos estáticos desde 'public'
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// Rutas principales de la API
app.use('/api', apiRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Manejador global de errores no capturados
app.use((err, req, res, next) => {
    console.error('Error no capturado:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
});

module.exports = app;
