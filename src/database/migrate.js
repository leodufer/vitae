const userModel = require('../models/userModel');

/**
 * Función para migrar la base de datos automáticamente al iniciar si es necesario
 */
async function migrateDatabase() {
    try {
        const hasColumn = await userModel.checkResetTokenColumn();
        if (!hasColumn) {
            console.log("> [DB MIGRATION] Agregando columnas 'reset_token' y 'reset_token_expires' a la tabla 'users'...");
            await userModel.addResetTokenColumns();
            console.log("> [DB MIGRATION] Base de datos migrada correctamente.");
        } else {
            console.log("> [DB MIGRATION] Las columnas de recuperación de contraseña ya existen.");
        }
    } catch (error) {
        console.error("> [DB MIGRATION] Error al intentar migrar la base de datos:", error);
    }
}

module.exports = migrateDatabase;
