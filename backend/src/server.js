const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 8000;

const start = async () => {
    try {
        if (pool && typeof pool.query === 'function') {
            await pool.query('SELECT 1');
            console.log('? Connected to PostgreSQL database successfully');
        } else {
            console.log('? Database pool initialized');
        }
    } catch (error) {
        console.warn('? Database warning:', error.message);
    }

    app.listen(PORT, () => {
        console.log(`? BMC Resource Planning API running on http://localhost:${PORT}`);
        console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    });
};

start();
