const { validationResult } = require('express-validator');

/**
 * Middleware para validar resultados de express-validator.
 * Si se proporciona customErrorMessage, devuelve { error: customErrorMessage }.
 * En caso contrario, devuelve { errors: errors.array() }.
 */
const validate = (customErrorMessage) => {
    return (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (customErrorMessage) {
                return res.status(400).json({ error: customErrorMessage });
            }
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    };
};

module.exports = validate;
