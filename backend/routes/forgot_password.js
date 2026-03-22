const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcryptjs');

// @route   POST /api/auth/forgot-password
// @desc    Generate reset token and "send" email
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const pool = await poolPromise;
        const userResult = await pool.request()
            .input('email', sql.NVARCHAR, email)
            .query('SELECT UserID FROM Users WHERE Email = @email');

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userId = userResult.recordset[0].UserID;
        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await pool.request()
            .input('userId', sql.INT, userId)
            .input('token', sql.NVARCHAR, token)
            .input('expires', sql.DATETIME, expires)
            .query('INSERT INTO Password_Resets (UserID, Token, ExpiresAt) VALUES (@userId, @token, @expires)');

        // Log token for "sent email" demonstration
        console.log(`Reset token for ${email}: ${token}`);

        res.json({ message: 'Password reset token generated (Check server logs)' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    try {
        const pool = await poolPromise;
        const resetResult = await pool.request()
            .input('token', sql.NVARCHAR, token)
            .query('SELECT * FROM Password_Resets WHERE Token = @token AND ExpiresAt > GETDATE()');

        if (resetResult.recordset.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const userId = resetResult.recordset[0].UserID;
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await pool.request()
            .input('userId', sql.INT, userId)
            .input('hash', sql.NVARCHAR, passwordHash)
            .query('UPDATE Users SET PasswordHash = @hash WHERE UserID = @userId');

        await pool.request()
            .input('token', sql.NVARCHAR, token)
            .query('DELETE FROM Password_Resets WHERE Token = @token');

        res.json({ message: 'Password has been reset' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
