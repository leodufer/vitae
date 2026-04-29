const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Configuración para servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal (por defecto cargará index.html de /public)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Puedes agregar más rutas de API aquí para el soporte de backend en el futuro
// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Token no proporcionado.' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey_change_me', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido o expirado.' });
        }
        req.user = decoded;
        next();
    });
};

app.get('/api/status', (req, res) => {
    res.json({ status: 'online', version: '1.0.4', environment: 'production' });
});

// --- API CV DATA ---

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

app.post('/api/cv/personal', verifyToken, async (req, res) => {
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

        res.json({
            personal: personal[0] || {},
            skills,
            soft_skills,
            experience,
            education,
            languages,
            social
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el CV completo.' });
    }
});

// Rutas de Autenticación
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Faltan campos requeridos.' });
        }

        const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'El email ya está registrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
        
        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Faltan campos requeridos.' });
        }

        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET || 'supersecretkey_change_me', 
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
    console.log(`🚀 Servidor ejecutándose en:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`=========================================`);
});
