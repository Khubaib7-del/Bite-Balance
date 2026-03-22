const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const serverAddress = process.env.DB_SERVER || 'localhost';
const database = process.env.DB_DATABASE || 'SmartMealPlanner';

console.log('Attempting connection to:', serverAddress);

const connectionString = `Driver={ODBC Driver 17 for SQL Server};Server=${serverAddress};Database=${database};Trusted_Connection=yes;`;
console.log('Using connection string:', connectionString);

const config = {
    connectionString: connectionString,
    options: {
        trustServerCertificate: true
    }
};

async function test() {
    try {
        const pool = await sql.connect(config);
        console.log('SUCCESS: Connected to database');
        const tableCheck = await pool.request().query("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users'");
        if (tableCheck.recordset.length > 0) {
            console.log('SUCCESS: Users table exists');
            const columns = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users'");
            console.log('Users columns:', columns.recordset);
        } else {
            console.log('FAILURE: Users table DOES NOT exist');
        }
        await pool.close();
    } catch (err) {
        console.error('FAILURE:', err.message);
    }
}

test();
