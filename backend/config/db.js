const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const serverAddress = process.env.DB_SERVER || 'localhost';
const database = process.env.DB_DATABASE || 'SmartMealPlanner';
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

// Flexible Connection String
let connectionString = `Driver={ODBC Driver 17 for SQL Server};Server=${serverAddress};Database=${database};`;

// Use SQL Authentication if a user and non-placeholder password are provided
const isPlaceholderPassword = !dbPassword || dbPassword === 'your_password_here' || dbPassword === 'admin123';
if (dbUser && dbUser !== 'sa_placeholder' && !isPlaceholderPassword) {
    connectionString += `Uid=${dbUser};Pwd=${dbPassword};`;
    console.log(`[DB] Attempting SQL Authentication (User: ${dbUser})`);
} else {
    // Default to Windows Authentication (Trusted Connection)
    connectionString += `Trusted_Connection=yes;`;
    console.log(`[DB] Attempting Windows Authentication (Trusted Connection)`);
}

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
