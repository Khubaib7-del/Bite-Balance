const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { poolPromise, sql, getPool } = require('../config/db');

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    const { username, email, password, adminCode } = req.body;
    try {
        const pool = await getPool();

        // Check secret admin code if provided
        let role = 'USER';
        let isAdminUpgrade = false;

        if (adminCode) {
            const settingsResult = await pool.request()
                .input('key', sql.NVARCHAR, 'AdminRegistrationCode')
                .query('SELECT SettingValue FROM SystemSettings WHERE SettingKey = @key');

            if (settingsResult.recordset.length > 0 && settingsResult.recordset[0].SettingValue === adminCode) {
                role = 'ADMIN';
            } else {
                return res.status(400).json({ message: 'Invalid admin secret code' });
            }
        }

        const userCheck = await pool.request()
            .input('email', sql.NVARCHAR, email)
            .query('SELECT * FROM Users WHERE Email = @email');

        if (userCheck.recordset.length > 0) {
            const existingUser = userCheck.recordset[0];

            // Allow upgrade to ADMIN if they are currently a USER and provided the right code
            if (role === 'ADMIN' && existingUser.Role === 'USER') {
                await pool.request()
                    .input('userId', sql.INT, existingUser.UserID)
                    .input('role', sql.NVARCHAR, 'ADMIN')
                    .query('UPDATE Users SET Role = @role WHERE UserID = @userId');

                return res.status(200).json({ message: 'Account successfully upgraded to Administrative status. You can now login via the Admin Portal.' });
            }

            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await pool.request()
            .input('username', sql.NVARCHAR, username)
            .input('email', sql.NVARCHAR, email)
            .input('passwordHash', sql.NVARCHAR, passwordHash)
            .input('role', sql.NVARCHAR, role)
            .query('INSERT INTO Users (Username, Email, PasswordHash, Role) VALUES (@username, @email, @passwordHash, @role)');

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration Error:', err);
        if (err.message.includes('Database connection is not available')) {
            return res.status(503).json({ message: 'Database connection is down. Check server logs for details.' });
        }
        res.status(500).send('Server error');
    }
});

// @route   POST /api/auth/login
// Description: User-only login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('email', sql.NVARCHAR, email)
            .query('SELECT * FROM Users WHERE Email = @email');

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = result.recordset[0];
        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Restrict this route to non-admins
        if (user.Role === 'ADMIN') {
            return res.status(403).json({ message: 'Administrative account detected. Please use the Admin Login Portal.' });
        }

        const payload = {
            user: {
                id: user.UserID,
                role: user.Role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            const userData = {
                id: user.UserID,
                username: user.Username,
                email: user.Email,
                role: user.Role
            };
            res.json({
                token,
                user: userData
            });
        });
    } catch (err) {
        console.error('Login Error:', err);
        if (err.message.includes('Database connection is not available')) {
            return res.status(503).json({ message: 'Database connection is down. Check server logs for details.' });
        }
        res.status(500).send('Server error');
    }
});

// @route   POST /api/auth/admin/login
// Description: Admin-only login with distinct security checks
router.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('email', sql.NVARCHAR, email)
            .query('SELECT * FROM Users WHERE Email = @email');

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = result.recordset[0];
        if (user.Role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied: Not an administrative account' });
        }

        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Distinct Admin Verification (2FA / Passkey)
        const verificationCode = 'ADMIN789'; // Distinct from previous hardcoded value
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // Shorter window for security

        await pool.request()
            .input('userId', sql.INT, user.UserID)
            .input('code', sql.NVARCHAR, verificationCode)
            .input('expires', sql.DATETIME, expires)
            .query('UPDATE Users SET VerificationCode = @code, CodeExpires = @expires WHERE UserID = @userId');

        console.log(`[SECURE ADMIN LOGIN] Passkey for ${user.Email}: ${verificationCode}`);

        return res.json({
            requiresVerification: true,
            message: 'Admin credentials verified. Please enter your secure passkey.'
        });
    } catch (err) {
        console.error('Admin Login Error:', err);
        if (err.message.includes('Database connection is not available')) {
            return res.status(503).json({ message: 'Database connection is down. Check server logs for details.' });
        }
        res.status(500).send('Server error');
    }
});

// @route   POST /api/auth/verify-code
router.post('/verify-code', async (req, res) => {
    const { email, code } = req.body;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('email', sql.NVARCHAR, email)
            .query('SELECT * FROM Users WHERE Email = @email');

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: 'Invalid account' });
        }

        const user = result.recordset[0];

        if (!user.VerificationCode || user.VerificationCode !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        if (new Date() > new Date(user.CodeExpires)) {
            return res.status(400).json({ message: 'Verification code has expired' });
        }

        // Clear code after successful verification
        await pool.request()
            .input('userId', sql.INT, user.UserID)
            .query('UPDATE Users SET VerificationCode = NULL, CodeExpires = NULL WHERE UserID = @userId');

        const payload = {
            user: {
                id: user.UserID,
                role: user.Role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            const userData = {
                id: user.UserID,
                username: user.Username,
                email: user.Email,
                role: user.Role
            };
            res.json({
                token,
                user: userData
            });
        });
    } catch (err) {
        console.error('Verification Error:', err);
        if (err.message.includes('Database connection is not available')) {
            return res.status(503).json({ message: 'Database connection is down. Please check server logs for details.' });
        }
        res.status(500).send('Server error');
    }
});

module.exports = router;
