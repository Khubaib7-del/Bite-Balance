const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../config/db');
const auth = require('../middleware/auth');

// @route   GET /api/foods
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM FoodItems');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/foods/search
router.get('/search', async (req, res) => {
    const { name } = req.query;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('name', sql.NVARCHAR, `%${name}%`)
            .query('SELECT * FROM FoodItems WHERE FoodName LIKE @name');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/foods
router.post('/', auth, async (req, res) => {
    const { FoodName, Calories, Protein, Carbohydrates, Fats } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.NVARCHAR, FoodName)
            .input('cal', sql.FLOAT, Calories)
            .input('pro', sql.FLOAT, Protein)
            .input('carb', sql.FLOAT, Carbohydrates)
            .input('fat', sql.FLOAT, Fats)
            .query('INSERT INTO FoodItems (FoodName, Calories, Protein, Carbohydrates, Fats) VALUES (@name, @cal, @pro, @carb, @fat)');
        res.status(201).json({ message: 'Food item added' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Other CRUD operations (PUT, DELETE) would follow similar logic...

module.exports = router;
