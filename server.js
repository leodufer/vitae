const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Use Helmet to set various HTTP headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for now as it might block inline scripts/styles in this project's current state, but could be enabled later
}));

// Middleware para parsear JSON
app.use(express.json());

// Configuración para servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rate Limiting: Prevent brute force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    message: { error: 'Demasiados intentos. Por favor, intente de nuevo más tarde.' }
});

const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    message: { error: 'Límite de peticiones excedido.' }
});

app.use('/api/', apiLimiter);
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

// Ruta principal (por defecto cargará index.html de /public)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Token no proporcionado.' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret || secret === 'supersecretkey_change_me') {
        console.warn('WARNING: JWT_SECRET is not set properly or using default value.');
    }

    jwt.verify(token, secret || 'supersecretkey_change_me', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido o expirado.' });
        }
        req.user = decoded;
        next();
    });
};

app.get('/api/status', (req, res) => {
    res.json({ status: 'online' }); // Minimal info exposure
});

// --- API CV DATA ---
// (Parameterized queries already used, which is good)

// Personal Data
app.get('/api/cv/personal', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM personal_data WHERE user_id = ?', [req.user.id]);
        res.json(rows[0] || {});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener datos personales.' });
    }
});

app.post('/api/cv/personal', verifyToken, [
    body('email').isEmail().normalizeEmail(),
    body('full_name').trim().escape().isLength({ min: 2, max: 100 }),
    body('phone').optional({ checkFalsy: true }).trim().escape(),
    body('location').optional({ checkFalsy: true }).trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { full_name, email, phone, location } = req.body;
        await pool.query(
            'INSERT INTO personal_data (user_id, full_name, email, phone, location) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE full_name = ?, email = ?, phone = ?, location = ?',
            [req.user.id, full_name, email, phone, location, full_name, email, phone, location]
        );
        res.json({ message: 'Datos personales guardados.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar datos personales.' });
    }
});

// Skills
app.get('/api/cv/skills', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM skills WHERE user_id = ?', [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener habilidades.' });
    }
});

app.post('/api/cv/skills', verifyToken, async (req, res) => {
    try {
        const { skills } = req.body; // Array of { skill_name, category }
        await pool.query('DELETE FROM skills WHERE user_id = ?', [req.user.id]);
        if (skills && skills.length > 0) {
            const values = skills.map(s => [req.user.id, s.skill_name, s.category]);
            await pool.query('INSERT INTO skills (user_id, skill_name, category) VALUES ?', [values]);
        }
        res.json({ message: 'Habilidades guardadas.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar habilidades.' });
    }
});

// Soft Skills
app.get('/api/cv/soft-skills', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM soft_skills WHERE user_id = ?', [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener habilidades blandas.' });
    }
});

app.post('/api/cv/soft-skills', verifyToken, async (req, res) => {
    try {
        const { skills } = req.body; // Array of { skill_name }
        await pool.query('DELETE FROM soft_skills WHERE user_id = ?', [req.user.id]);
        if (skills && skills.length > 0) {
            const values = skills.map(s => [req.user.id, s.skill_name]);
            await pool.query('INSERT INTO soft_skills (user_id, skill_name) VALUES ?', [values]);
        }
        res.json({ message: 'Habilidades blandas guardadas.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar habilidades blandas.' });
    }
});

// Experience
app.get('/api/cv/experience', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM experience WHERE user_id = ?', [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener experiencia.' });
    }
});

app.post('/api/cv/experience', verifyToken, async (req, res) => {
    try {
        const { experiences } = req.body; // Array of { position, company, duration, description }
        await pool.query('DELETE FROM experience WHERE user_id = ?', [req.user.id]);
        if (experiences && experiences.length > 0) {
            const values = experiences.map(e => [req.user.id, e.position, e.company, e.duration, e.description]);
            await pool.query('INSERT INTO experience (user_id, position, company, duration, description) VALUES ?', [values]);
        }
        res.json({ message: 'Experiencia guardada.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar experiencia.' });
    }
});

// Education
app.get('/api/cv/education', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM education WHERE user_id = ?', [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener educación.' });
    }
});

app.post('/api/cv/education', verifyToken, async (req, res) => {
    try {
        const { education } = req.body; // Array of { degree, institution, duration }
        await pool.query('DELETE FROM education WHERE user_id = ?', [req.user.id]);
        if (education && education.length > 0) {
            const values = education.map(e => [req.user.id, e.degree, e.institution, e.duration]);
            await pool.query('INSERT INTO education (user_id, degree, institution, duration) VALUES ?', [values]);
        }
        res.json({ message: 'Educación guardada.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar educación.' });
    }
});

// Languages
app.get('/api/cv/languages', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM languages WHERE user_id = ?', [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener idiomas.' });
    }
});

app.post('/api/cv/languages', verifyToken, async (req, res) => {
    try {
        const { languages } = req.body; // Array of { language_name, level }
        await pool.query('DELETE FROM languages WHERE user_id = ?', [req.user.id]);
        if (languages && languages.length > 0) {
            const values = languages.map(l => [req.user.id, l.language_name, l.level]);
            await pool.query('INSERT INTO languages (user_id, language_name, level) VALUES ?', [values]);
        }
        res.json({ message: 'Idiomas guardados.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar idiomas.' });
    }
});

// Social Networks
app.get('/api/cv/social', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM social_networks WHERE user_id = ?', [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener redes sociales.' });
    }
});

app.post('/api/cv/social', verifyToken, async (req, res) => {
    try {
        const { networks } = req.body; // Array of { platform, url }
        await pool.query('DELETE FROM social_networks WHERE user_id = ?', [req.user.id]);
        if (networks && networks.length > 0) {
            const values = networks.map(n => [req.user.id, n.platform, n.url]);
            await pool.query('INSERT INTO social_networks (user_id, platform, url) VALUES ?', [values]);
        }
        res.json({ message: 'Redes sociales guardadas.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar redes sociales.' });
    }
});

// Training
app.get('/api/cv/training', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM training WHERE user_id = ?', [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener capacitaciones.' });
    }
});

app.post('/api/cv/training', verifyToken, async (req, res) => {
    try {
        const { training } = req.body; // Array of { course_name, institution, duration, description }
        await pool.query('DELETE FROM training WHERE user_id = ?', [req.user.id]);
        if (training && training.length > 0) {
            const values = training.map(t => [req.user.id, t.course_name, t.institution, t.duration, t.description]);
            await pool.query('INSERT INTO training (user_id, course_name, institution, duration, description) VALUES ?', [values]);
        }
        res.json({ message: 'Capacitaciones guardadas.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar capacitaciones.' });
    }
});

// Personal References
app.get('/api/cv/references', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM personal_references WHERE user_id = ?', [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener referencias personales.' });
    }
});

app.post('/api/cv/references', verifyToken, async (req, res) => {
    try {
        const { references } = req.body; // Array of { ref_name, relationship, phone, email }
        await pool.query('DELETE FROM personal_references WHERE user_id = ?', [req.user.id]);
        if (references && references.length > 0) {
            const values = references.map(r => [req.user.id, r.ref_name, r.relationship, r.phone, r.email]);
            await pool.query('INSERT INTO personal_references (user_id, ref_name, relationship, phone, email) VALUES ?', [values]);
        }
        res.json({ message: 'Referencias personales guardadas.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar referencias personales.' });
    }
});

// Get Full CV Data
app.get('/api/cv/full', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [personal] = await pool.query('SELECT * FROM personal_data WHERE user_id = ?', [userId]);
        const [skills] = await pool.query('SELECT * FROM skills WHERE user_id = ?', [userId]);
        const [soft_skills] = await pool.query('SELECT * FROM soft_skills WHERE user_id = ?', [userId]);
        const [experience] = await pool.query('SELECT * FROM experience WHERE user_id = ?', [userId]);
        const [education] = await pool.query('SELECT * FROM education WHERE user_id = ?', [userId]);
        const [languages] = await pool.query('SELECT * FROM languages WHERE user_id = ?', [userId]);
        const [social] = await pool.query('SELECT * FROM social_networks WHERE user_id = ?', [userId]);
        const [training] = await pool.query('SELECT * FROM training WHERE user_id = ?', [userId]);
        const [references] = await pool.query('SELECT * FROM personal_references WHERE user_id = ?', [userId]);

        res.json({
            personal: personal[0] || {},
            skills,
            soft_skills,
            experience,
            education,
            languages,
            social,
            training,
            references
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el CV completo.' });
    }
});

// Rutas de Autenticación
app.post('/api/register', [
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Datos de entrada inválidos.' });
    }

    try {
        const { name, email, password } = req.body;

        const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'El email ya está registrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
        
        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.post('/api/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Email o contraseña inválidos.' });
    }

    try {
        const { email, password } = req.body;

        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const secret = process.env.JWT_SECRET || 'supersecretkey_change_me';
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            secret, 
            { expiresIn: '1h' }
        );
        
        res.json({ 
            message: 'Autenticación exitosa', 
            token, 
            user: { id: user.id, name: user.name, email: user.email } 
        });
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Servidor ejecutándose en: http://localhost:${PORT}`);
    console.log(`=========================================`);
});
