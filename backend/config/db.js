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

console.log('Connecting to database:', serverAddress);

const poolPromise = sql.connect(config)
    .then(pool => {
        console.log('Connected to MSSQL successfully');
        return pool;
    })
    .catch(err => {
        console.error('CRITICAL: Database Connection Failed!');
        console.error('Error Message:', err.message);
        
        if (err.message.includes('ODBC Driver 17')) {
            console.error('HINT: "ODBC Driver 17 for SQL Server" might be missing. Install it from Microsoft.');
        } else if (err.message.includes('Server not found') || err.message.includes('getaddrinfo ENOTFOUND')) {
            console.error(`HINT: Could not find server "${serverAddress}". Check your .env DB_SERVER setting.`);
        } else if (err.message.includes('Login failed')) {
            console.error('HINT: Authentication failed. Check your Trusted_Connection or credentials.');
        }
        
        return null;
    });

/**
 * Helper to ensure the pool is available before making requests
 * Returns the pool or throws a descriptive error
 */
const getPool = async () => {
    const pool = await poolPromise;
    if (!pool) {
        throw new Error('Database connection is not available. Check server logs.');
    }
    return pool;
};

module.exports = {
    sql, poolPromise, getPool
};
