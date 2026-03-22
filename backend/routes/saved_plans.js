const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../config/db');
const auth = require('../middleware/auth');

// @route   POST /api/saved-plans
// @desc    Save current meal plan as a template
router.post('/', auth, async (req, res) => {
    const { planName, items } = req.body;
    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const planResult = await transaction.request()
                .input('userId', sql.INT, req.user.id)
                .input('name', sql.NVARCHAR, planName)
                .query('INSERT INTO Saved_Meal_Plans (UserID, PlanName) OUTPUT INSERTED.PlanID VALUES (@userId, @name)');

            const planId = planResult.recordset[0].PlanID;

            for (const item of items) {
                await transaction.request()
                    .input('planId', sql.INT, planId)
                    .input('foodId', sql.INT, item.FoodID)
                    .input('qty', sql.FLOAT, item.Quantity)
                    .input('type', sql.NVARCHAR, item.MealType)
                    .query('INSERT INTO Saved_Plan_Items (PlanID, FoodID, Quantity, MealType) VALUES (@planId, @foodId, @qty, @type)');
            }

            await transaction.commit();
            res.json({ message: 'Plan saved successfully', planId });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/saved-plans
// @desc    Get all saved plans for user
router.get('/', auth, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.INT, req.user.id)
            .query('SELECT * FROM Saved_Meal_Plans WHERE UserID = @userId ORDER BY CreatedAt DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/saved-plans/:id
// @desc    Get specific plan details
router.get('/:id', auth, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('planId', sql.INT, req.params.id)
            .input('userId', sql.INT, req.user.id)
            .query(`
                SELECT spi.*, f.FoodName, f.Calories, f.Protein, f.Carbohydrates, f.Fats
                FROM Saved_Plan_Items spi
                JOIN FoodItems f ON spi.FoodID = f.FoodID
                JOIN Saved_Meal_Plans smp ON spi.PlanID = smp.PlanID
                WHERE spi.PlanID = @planId AND smp.UserID = @userId
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/saved-plans/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('planId', sql.INT, req.params.id)
            .input('userId', sql.INT, req.user.id)
            .query('DELETE FROM Saved_Meal_Plans WHERE PlanID = @planId AND UserID = @userId');
        res.json({ message: 'Plan deleted' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
