const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../config/db');
const auth = require('../middleware/auth');

// @route   POST /api/mealplan
router.post('/', auth, async (req, res) => {
    const { date } = req.body;
    try {
        const pool = await poolPromise;

        // Check if plan already exists for this user and date
        const checkResult = await pool.request()
            .input('userId', sql.INT, req.user.id)
            .input('date', sql.DATE, date)
            .query('SELECT MealPlanID FROM MealPlans WHERE UserID = @userId AND Date = @date');

        if (checkResult.recordset.length > 0) {
            return res.json({ mealPlanId: checkResult.recordset[0].MealPlanID });
        }

        const result = await pool.request()
            .input('userId', sql.INT, req.user.id)
            .input('date', sql.DATE, date)
            .query('INSERT INTO MealPlans (UserID, Date) OUTPUT INSERTED.MealPlanID VALUES (@userId, @date)');
        res.json({ mealPlanId: result.recordset[0].MealPlanID });
    } catch (err) {
        console.error('Error creating meal plan:', err);
        res.status(500).json({ message: 'Failed to create meal plan', error: err.message });
    }
});

// @route   POST /api/mealplan/add-food
router.post('/add-food', auth, async (req, res) => {
    const { mealPlanId, foodId, quantity, mealType } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('mpId', sql.INT, mealPlanId)
            .input('fId', sql.INT, foodId)
            .input('qty', sql.FLOAT, quantity)
            .input('type', sql.NVARCHAR(20), mealType)
            .query('INSERT INTO MealPlanFoods (MealPlanID, FoodID, Quantity, MealType) VALUES (@mpId, @fId, @qty, @type)');
        res.json({ message: 'Food added to meal plan' });
    } catch (err) {
        console.error('Error adding food to meal plan:', err);
        res.status(500).json({ message: 'Failed to add food to meal plan', error: err.message });
    }
});

// @route   GET /api/mealplan/nutrition-summary/:date
router.get('/nutrition-summary/:date', auth, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.INT, req.user.id)
            .input('date', sql.DATE, req.params.date)
            .query(`
                SELECT 
                    SUM(f.Calories * mpf.Quantity) as TotalCalories,
                    SUM(f.Protein * mpf.Quantity) as TotalProtein,
                    SUM(f.Carbohydrates * mpf.Quantity) as TotalCarbohydrates,
                    SUM(f.Fats * mpf.Quantity) as TotalFats
                FROM MealPlans mp
                JOIN MealPlanFoods mpf ON mp.MealPlanID = mpf.MealPlanID
                JOIN FoodItems f ON mpf.FoodID = f.FoodID
                WHERE mp.UserID = @userId AND mp.Date = @date
            `);
        res.json(result.recordset[0] || { TotalCalories: 0, TotalProtein: 0, TotalCarbohydrates: 0, TotalFats: 0 });
    } catch (err) {
        console.error('Nutrition Summary DB Error:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   GET /api/mealplan/weekly-summary
router.get('/weekly-summary', auth, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.INT, req.user.id)
            .query(`
                SELECT 
                    FORMAT(mp.Date, 'ddd') as day,
                    SUM(f.Calories * mpf.Quantity) as calories,
                    SUM(f.Protein * mpf.Quantity) as protein,
                    SUM(f.Carbohydrates * mpf.Quantity) as carbs,
                    SUM(f.Fats * mpf.Quantity) as fats
                FROM MealPlans mp
                JOIN MealPlanFoods mpf ON mp.MealPlanID = mpf.MealPlanID
                JOIN FoodItems f ON mpf.FoodID = f.FoodID
                WHERE mp.UserID = @userId 
                  AND mp.Date >= DATEADD(day, -7, GETDATE())
                GROUP BY mp.Date
                ORDER BY mp.Date ASC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Weekly Summary Error:', err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/mealplan/:date
router.get('/:date', auth, async (req, res) => {
    try {
        const pool = await poolPromise;
        // First, check if the plan exists just to get the ID
        const planResult = await pool.request()
            .input('userId', sql.INT, req.user.id)
            .input('date', sql.DATE, req.params.date)
            .query('SELECT MealPlanID FROM MealPlans WHERE UserID = @userId AND Date = @date');

        if (planResult.recordset.length === 0) {
            return res.json({ mealPlanId: null, items: [] });
        }

        const mealPlanId = planResult.recordset[0].MealPlanID;

        const itemsResult = await pool.request()
            .input('mpId', sql.INT, mealPlanId)
            .query(`
                SELECT mpf.ID as EntryID, f.FoodID, f.FoodName, f.Calories, f.Protein, f.Carbohydrates, f.Fats, mpf.Quantity, mpf.MealType, mpf.MealPlanID
                FROM MealPlanFoods mpf
                JOIN FoodItems f ON mpf.FoodID = f.FoodID
                WHERE mpf.MealPlanID = @mpId
            `);

        res.json({ mealPlanId, items: itemsResult.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/mealplan/entry/:entryId
router.delete('/entry/:entryId', auth, async (req, res) => {
    try {
        const pool = await poolPromise;
        // Verify owner before deleting
        const checkResult = await pool.request()
            .input('entryId', sql.INT, req.params.entryId)
            .input('userId', sql.INT, req.user.id)
            .query('SELECT 1 FROM MealPlanFoods mpf JOIN MealPlans mp ON mpf.MealPlanID = mp.MealPlanID WHERE mpf.ID = @entryId AND mp.UserID = @userId');

        if (checkResult.recordset.length === 0) {
            return res.status(403).json({ message: 'Not authorized to delete this entry' });
        }

        await pool.request()
            .input('entryId', sql.INT, req.params.entryId)
            .query('DELETE FROM MealPlanFoods WHERE ID = @entryId');
        res.json({ message: 'Entry removed' });
    } catch (err) {
        console.error('Error deleting entry:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
