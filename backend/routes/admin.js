const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../config/db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// --- User Management ---
router.get('/users', auth, admin, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT UserID, Username, Email, Role, CreatedAt FROM Users');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.put('/users/:id', auth, admin, async (req, res) => {
    const { username, email, role } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.INT, req.params.id)
            .input('username', sql.NVARCHAR, username)
            .input('email', sql.NVARCHAR, email)
            .input('role', sql.NVARCHAR, role)
            .query('UPDATE Users SET Username = @username, Email = @email, Role = @role WHERE UserID = @id');
        res.json({ message: 'User updated' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.delete('/users/:id', auth, admin, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request().input('id', sql.INT, req.params.id).query('DELETE FROM Users WHERE UserID = @id');
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// --- Article Management ---
router.post('/articles', auth, admin, async (req, res) => {
    const { title, content, category } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('title', sql.NVARCHAR, title)
            .input('content', sql.NVARCHAR, content)
            .input('category', sql.NVARCHAR, category)
            .query('INSERT INTO Articles (Title, Content, Category) VALUES (@title, @content, @category)');
        res.json({ message: 'Article created' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.get('/articles', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Articles ORDER BY CreatedAt DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.delete('/articles/:id', auth, admin, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request().input('id', sql.INT, req.params.id).query('DELETE FROM Articles WHERE ArticleID = @id');
        res.json({ message: 'Article deleted' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// --- System Settings ---
router.get('/settings/admin-code', auth, admin, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('key', sql.NVARCHAR, 'AdminRegistrationCode')
            .query('SELECT SettingValue FROM SystemSettings WHERE SettingKey = @key');
        res.json({ adminCode: result.recordset[0].SettingValue });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.put('/settings/admin-code', auth, admin, async (req, res) => {
    const { adminCode } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('key', sql.NVARCHAR, 'AdminRegistrationCode')
            .input('value', sql.NVARCHAR, adminCode)
            .query('UPDATE SystemSettings SET SettingValue = @value WHERE SettingKey = @key');
        res.json({ message: 'Admin registration code updated' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
