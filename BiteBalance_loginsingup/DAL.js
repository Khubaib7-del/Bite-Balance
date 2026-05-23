/*
    Bite Balance - Data Access Layer (DAL)
    This file handles all database connectivity and execution of stored procedures.
    Maps to the "3rd Tier DAL.cs" requirement.
*/

const { Pool } = require('pg');
require('dotenv').config();

// Database Connection Configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

/**
 * Executes a raw query or a stored procedure call.
 */
const executeQuery = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (err) {
        console.error('Database Error:', err);
        throw err;
    }
};

/**
 * DAL Function for User Registration
 * Calls the Stored Procedure 'sp_RegisterUser'
 */
const registerUserDAL = async (username, email, passwordHash, role) => {
    // Calling Postgres Stored Procedure with OUT parameters
    const sql = `CALL "sp_RegisterUser"($1, $2, $3, $4, NULL, NULL)`;
    const params = [username, email, passwordHash, role];
    
    // In pg-node, CALL returns the OUT parameters in rows[0]
    const result = await executeQuery(sql, params);
    return result.rows[0];
};

/**
 * DAL Function for User Login
 * Calls the Function 'fn_ValidateLogin'
 */
const validateLoginDAL = async (email) => {
    const sql = `SELECT * FROM "fn_ValidateLogin"($1)`;
    const result = await executeQuery(sql, [email]);
    return result.rows[0]; // Returns user record if found
};

/**
 * DAL Function to get profile via View
 */
const getUserProfileDAL = async (userId) => {
    const sql = `SELECT * FROM "vw_UserProfileDetails" WHERE "UserID" = $1`;
    const result = await executeQuery(sql, [userId]);
    return result.rows[0];
};

module.exports = {
    registerUserDAL,
    validateLoginDAL,
    getUserProfileDAL,
    pool
};
