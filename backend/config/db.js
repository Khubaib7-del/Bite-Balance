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
        console.error('Database Connection Failed! ', err.message);
        return null;
    });

module.exports = {
    sql, poolPromise
};
