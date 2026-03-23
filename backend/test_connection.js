const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const serverAddress = process.env.DB_SERVER || 'localhost';
const database = process.env.DB_DATABASE || 'SmartMealPlanner';

const connectionString = `Driver={ODBC Driver 17 for SQL Server};Server=${serverAddress};Database=${database};Trusted_Connection=yes;`;

const config = {
    connectionString: connectionString,
    options: {
        enableArithAbort: true,
        trustServerCertificate: true
    }
};

console.log('--- Database Connection Diagnostic ---');
console.log('Attempting to connect to:', serverAddress);
console.log('Using database:', database);
console.log('Connection String:', connectionString);
console.log('--------------------------------------');

async function runDiagnostic() {
    try {
        const pool = await sql.connect(config);
        console.log('✅ SUCCESS: Connected to SQL Server successfully.');
        
        const result = await pool.request().query('SELECT TOP 1 * FROM Users');
        console.log('✅ SUCCESS: Database schema is accessible (Users table found).');
        
        await pool.close();
        console.log('Diagnostic complete. Everything looks good!');
    } catch (err) {
        console.error('❌ FAILURE: Could not connect to the database.');
        console.error('Error details:', err.message);
        
        if (err.message.includes('ODBC Driver 17')) {
            console.log('\nHINT: You are missing "ODBC Driver 17 for SQL Server".');
            console.log('Please download and install it from Microsoft.');
        } else if (err.message.includes('Server not found') || err.message.includes('getaddrinfo ENOTFOUND')) {
            console.log(`\nHINT: The server "${serverAddress}" was not found.`);
            console.log('Make sure your DB_SERVER in .env matches your SQL Server instance name (e.g. localhost\\SQLEXPRESS).');
        } else if (err.message.includes('Login failed')) {
            console.log('\nHINT: Authentication failed. Ensure your Windows user has access to the SQL Server.');
        } else if (err.message.includes('Invalid object name \'Users\'')) {
            console.log('\nHINT: The database exists, but the "Users" table was not found.');
            console.log('Did you run the "database/schema.sql" script?');
        }
        
        process.exit(1);
    }
}

runDiagnostic();
