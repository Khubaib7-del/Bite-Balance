const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function checkUser() {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('email', sql.NVARCHAR, 'khubaibnazeer8@gmail.com')
            .query('SELECT UserID, Username, Email, Role, CreatedAt FROM Users WHERE Email = @email');
        
        console.log(JSON.stringify(result.recordset, null, 2));
        await sql.close();
    } catch (err) {
        console.error(err);
    }
}

checkUser();
