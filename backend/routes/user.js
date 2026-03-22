const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../config/db');
const auth = require('../middleware/auth');

// @route   GET /api/user/profile
router.get('/profile', auth, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.INT, req.user.id)
            .query('SELECT * FROM UserProfiles WHERE UserID = @userId');

        if (result.recordset.length === 0) {
            return res.json({});
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/user/profile
router.post('/profile', auth, async (req, res) => {
    const { weight, height, age, gender, activityLevel, goal } = req.body;
    try {
        const pool = await poolPromise;

        // Use UPSERT logic
        await pool.request()
            .input('userId', sql.INT, req.user.id)
            .input('weight', sql.FLOAT, weight)
            .input('height', sql.FLOAT, height)
            .input('age', sql.INT, age)
            .input('gender', sql.NVARCHAR(20), gender)
            .input('activity', sql.NVARCHAR(50), activityLevel)
            .input('goal', sql.NVARCHAR(50), goal)
            .query(`
                IF EXISTS (SELECT 1 FROM UserProfiles WHERE UserID = @userId)
                BEGIN
                    UPDATE UserProfiles SET 
                        Weight = @weight, Height = @height, Age = @age, 
                        Gender = @gender, ActivityLevel = @activity, Goal = @goal,
                        UpdatedAt = GETDATE()
                    WHERE UserID = @userId
                END
                ELSE
                BEGIN
                    INSERT INTO UserProfiles (UserID, Weight, Height, Age, Gender, ActivityLevel, Goal)
                    VALUES (@userId, @weight, @height, @age, @gender, @activity, @goal)
                END
            `);

        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
