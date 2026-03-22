const { poolPromise } = require('./config/db');

async function checkSchema() {
    try {
        const pool = await poolPromise;
        const tables = await pool.request().query("SELECT name FROM sys.tables");
        console.log('Tables in database:');
        console.table(tables.recordset);

        try {
            const mpf = await pool.request().query('SELECT TOP 1 * FROM MealPlanFoods');
            console.log('MealPlanFoods table exists and is accessible.');
        } catch (e) {
            console.error('Error accessing MealPlanFoods:', e.message);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error checking schema:', err);
        process.exit(1);
    }
}

checkSchema();
