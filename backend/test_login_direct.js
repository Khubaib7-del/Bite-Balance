const sql = require('mssql');
const bcrypt = require('bcryptjs');
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

async function testLogin() {
    try {
        let pool = await sql.connect(config);
        const email = 'khubaibnazeer8@gmail.com';
        const password = '123456';

        let result = await pool.request()
            .input('email', sql.NVARCHAR, email)
            .query('SELECT * FROM Users WHERE Email = @email');
        
        if (result.recordset.length === 0) {
            console.log('User not found');
            return;
        }

        const user = result.recordset[0];
        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        
        console.log('User found:', user.Email);
        console.log('Role:', user.Role);
        console.log('Password Match:', isMatch);
        
        await sql.close();
    } catch (err) {
        console.error(err);
    }
}

testLogin();
