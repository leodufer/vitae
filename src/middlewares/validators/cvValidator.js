const { body } = require('express-validator');
const validate = require('./validateHandler');

const personalDataValidator = [
    body('email').isEmail().normalizeEmail(),
    body('full_name').trim().escape().isLength({ min: 2, max: 100 }),
    body('phone').optional({ checkFalsy: true }).trim().escape(),
    body('location').optional({ checkFalsy: true }).trim().escape(),
    validate() // Devuelve { errors: errors.array() } tal como lo espera el frontend
];

module.exports = {
    personalDataValidator
};
