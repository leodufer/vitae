const app = require('./src/app');
const { PORT } = require('./src/config/env');
const migrateDatabase = require('./src/database/migrate');

// Iniciar el servidor
async function startServer() {
    await migrateDatabase();
    app.listen(PORT, () => {
        console.log(`=========================================`);
        console.log(`🚀 Servidor ejecutándose en: http://localhost:${PORT}`);
        console.log(`=========================================`);
    });
}

startServer();
