const { body } = require('express-validator');
const validate = require('./validateHandler');

const registerValidator = [
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    validate('Datos de entrada inválidos.')
];

const loginValidator = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validate('Email o contraseña inválidos.')
];

const forgotPasswordValidator = [
    body('email').isEmail().normalizeEmail(),
    validate('Formato de email inválido.')
];

const resetPasswordValidator = [
    body('token').notEmpty().trim(),
    body('password').isLength({ min: 6 }),
    validate('La contraseña debe tener al menos 6 caracteres y el token debe ser válido.')
];

module.exports = {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator
};
