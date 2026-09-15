const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userModel = require('../models/userModel');
const { JWT_SECRET, PORT } = require('../config/env');

const authController = {
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            const existingUser = await userModel.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({ error: 'El email ya está registrado.' });
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            await userModel.create({ name, email, password: hashedPassword });

            res.status(201).json({ message: 'Usuario registrado exitosamente.' });
        } catch (error) {
            console.error('Error en el registro:', error);
            res.status(500).json({ error: 'Error interno del servidor.' });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await userModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Credenciales inválidas.' });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ error: 'Credenciales inválidas.' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                JWT_SECRET,
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
    },

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            const user = await userModel.findByEmail(email);
            const successMessage = 'Si el correo ingresado coincide con un usuario registrado, recibirás un enlace de recuperación.';

            if (!user) {
                return res.json({ message: successMessage });
            }

            const token = crypto.randomBytes(20).toString('hex');
            const expires = new Date(Date.now() + 3600000); // 1 hora de validez

            await userModel.saveResetToken(user.id, token, expires);

            const resetLink = `http://localhost:${PORT}/auth.html?token=${token}`;
            console.log(`\n=========================================`);
            console.log(`✉️ SIMULACIÓN DE CORREO DE RECUPERACIÓN`);
            console.log(`Para: ${email}`);
            console.log(`Asunto: Recuperación de contraseña`);
            console.log(`Enlace: ${resetLink}`);
            console.log(`=========================================\n`);

            res.json({
                message: successMessage,
                _dev_link: resetLink
            });
        } catch (error) {
            console.error('Error en forgot-password:', error);
            res.status(500).json({ error: 'Error interno del servidor.' });
        }
    },

    async resetPassword(req, res) {
        try {
            const { token, password } = req.body;

            const user = await userModel.findByValidResetToken(token);
            if (!user) {
                return res.status(400).json({ error: 'El token de recuperación es inválido o ha expirado.' });
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            await userModel.updatePasswordAndClearReset(user.id, hashedPassword);

            res.json({ message: 'Contraseña restablecida exitosamente.' });
        } catch (error) {
            console.error('Error en reset-password:', error);
            res.status(500).json({ error: 'Error interno del servidor.' });
        }
    }
};

module.exports = authController;
