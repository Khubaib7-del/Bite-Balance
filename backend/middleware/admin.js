const { poolPromise, sql } = require('../config/db');

module.exports = async function (req, res, next) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.INT, req.user.id)
            .query('SELECT Role FROM Users WHERE UserID = @userId');

        if (result.recordset.length > 0 && result.recordset[0].Role === 'ADMIN') {
            next();
        } else {
            res.status(403).json({ message: 'Access denied: Admin only' });
        }
    } catch (err) {
        res.status(500).send('Server Error');
    }
};
