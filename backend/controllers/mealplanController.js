const { getPool, query } = require('../config/db');
const { logActivity } = require('../utils/activity');

const createMealPlan = async (req, res) => {
    const { date } = req.body;

    if (!date) {
        return res.status(400).json({ message: 'Date is required' });
    }

    try {
        const result = await query(
            `INSERT INTO "MealPlans" ("UserID", "Date")
             VALUES ($1, $2)
             ON CONFLICT ("UserID", "Date") DO UPDATE SET "Date" = EXCLUDED."Date"
             RETURNING "MealPlanID"`,
            [req.user.id, date]
        );

        await logActivity({
            userId: req.user.id,
            type: 'MEALPLAN_CREATED',
            detail: `Meal plan created for ${date}`
        });

        return res.json({ mealPlanId: result.rows[0].MealPlanID });
    } catch (err) {
        console.error('Error creating meal plan:', err);
        return res.status(500).json({ message: 'Failed to create meal plan', error: err.message });
    }
};

const addFoodToMealPlan = async (req, res) => {
    const { mealPlanId, foodId, quantity = 1, mealType = 'Lunch' } = req.body;

    try {
        const ownership = await query(
            'SELECT 1 FROM "MealPlans" WHERE "MealPlanID" = $1 AND "UserID" = $2',
            [mealPlanId, req.user.id]
        );

        if (ownership.rowCount === 0) {
            return res.status(403).json({ message: 'Not authorized to modify this meal plan' });
        }

        await query(
            'INSERT INTO "MealPlanFoods" ("MealPlanID", "FoodID", "Quantity", "MealType") VALUES ($1, $2, $3, $4)',
            [mealPlanId, foodId, quantity, mealType]
        );

        await logActivity({
            userId: req.user.id,
            type: 'MEALPLAN_ITEM_ADDED',
            detail: `Added food ${foodId} to ${mealType}`,
            meta: { mealPlanId, foodId, quantity, mealType }
        });

        return res.json({ message: 'Food added to meal plan' });
    } catch (err) {
        console.error('Error adding food to meal plan:', err);
        return res.status(500).json({ message: 'Failed to add food to meal plan', error: err.message });
    }
};

const getNutritionSummary = async (req, res) => {
    try {
        const result = await query(
            `SELECT
                COALESCE(SUM(f."Calories" * mpf."Quantity"), 0) AS "TotalCalories",
                COALESCE(SUM(f."Protein" * mpf."Quantity"), 0) AS "TotalProtein",
                COALESCE(SUM(f."Carbohydrates" * mpf."Quantity"), 0) AS "TotalCarbohydrates",
                COALESCE(SUM(f."Fats" * mpf."Quantity"), 0) AS "TotalFats"
             FROM "MealPlans" mp
             JOIN "MealPlanFoods" mpf ON mp."MealPlanID" = mpf."MealPlanID"
             JOIN "FoodItems" f ON mpf."FoodID" = f."FoodID"
             WHERE mp."UserID" = $1 AND mp."Date" = $2`,
            [req.user.id, req.params.date]
        );

        return res.json(result.rows[0] || { TotalCalories: 0, TotalProtein: 0, TotalCarbohydrates: 0, TotalFats: 0 });
    } catch (err) {
        console.error('Nutrition Summary DB Error:', err);
        return res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const getWeeklySummary = async (req, res) => {
    try {
        const result = await query(
            `SELECT
                TRIM(TO_CHAR(mp."Date", 'Dy')) AS day,
                COALESCE(SUM(f."Calories" * mpf."Quantity"), 0) AS calories,
                COALESCE(SUM(f."Protein" * mpf."Quantity"), 0) AS protein,
                COALESCE(SUM(f."Carbohydrates" * mpf."Quantity"), 0) AS carbs,
                COALESCE(SUM(f."Fats" * mpf."Quantity"), 0) AS fats
             FROM "MealPlans" mp
             JOIN "MealPlanFoods" mpf ON mp."MealPlanID" = mpf."MealPlanID"
             JOIN "FoodItems" f ON mpf."FoodID" = f."FoodID"
             WHERE mp."UserID" = $1
               AND mp."Date" >= CURRENT_DATE - INTERVAL '6 days'
             GROUP BY mp."Date"
             ORDER BY mp."Date" ASC`,
            [req.user.id]
        );

        return res.json(result.rows);
    } catch (err) {
        console.error('Weekly Summary Error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const getMealPlanByDate = async (req, res) => {
    try {
        const planResult = await query(
            'SELECT "MealPlanID" FROM "MealPlans" WHERE "UserID" = $1 AND "Date" = $2',
            [req.user.id, req.params.date]
        );

        if (planResult.rowCount === 0) {
            return res.json({ mealPlanId: null, items: [] });
        }

        const mealPlanId = planResult.rows[0].MealPlanID;

        const itemsResult = await query(
            `SELECT
                mpf."ID" AS "EntryID",
                f."FoodID",
                f."FoodName",
                f."Calories",
                f."Protein",
                f."Carbohydrates",
                f."Fats",
                f."ImagePath",
                mpf."Quantity",
                mpf."MealType",
                mpf."MealPlanID"
             FROM "MealPlanFoods" mpf
             JOIN "FoodItems" f ON mpf."FoodID" = f."FoodID"
             WHERE mpf."MealPlanID" = $1
             ORDER BY mpf."ID" ASC`,
            [mealPlanId]
        );

        return res.json({ mealPlanId, items: itemsResult.rows });
    } catch (err) {
        console.error('Get meal plan error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const deleteMealPlanEntry = async (req, res) => {
    try {
        const ownershipResult = await query(
            `SELECT 1
             FROM "MealPlanFoods" mpf
             JOIN "MealPlans" mp ON mpf."MealPlanID" = mp."MealPlanID"
             WHERE mpf."ID" = $1 AND mp."UserID" = $2`,
            [req.params.entryId, req.user.id]
        );

        if (ownershipResult.rowCount === 0) {
            return res.status(403).json({ message: 'Not authorized to delete this entry' });
        }

        await query('DELETE FROM "MealPlanFoods" WHERE "ID" = $1', [req.params.entryId]);
        return res.json({ message: 'Entry removed' });
    } catch (err) {
        console.error('Error deleting entry:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const replaceTodayWithSavedPlan = async (req, res) => {
    const { planId, date } = req.body;

    if (!planId || !date) {
        return res.status(400).json({ message: 'planId and date are required' });
    }

    const pool = await getPool();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const mealPlanResult = await client.query(
            `INSERT INTO "MealPlans" ("UserID", "Date")
             VALUES ($1, $2)
             ON CONFLICT ("UserID", "Date") DO UPDATE SET "Date" = EXCLUDED."Date"
             RETURNING "MealPlanID"`,
            [req.user.id, date]
        );

        const mealPlanId = mealPlanResult.rows[0].MealPlanID;

        const ownershipResult = await client.query(
            'SELECT 1 FROM "Saved_Meal_Plans" WHERE "PlanID" = $1 AND "UserID" = $2',
            [planId, req.user.id]
        );

        if (ownershipResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Saved plan not found' });
        }

        await client.query('DELETE FROM "MealPlanFoods" WHERE "MealPlanID" = $1', [mealPlanId]);

        await client.query(
            `INSERT INTO "MealPlanFoods" ("MealPlanID", "FoodID", "Quantity", "MealType")
             SELECT $1, spi."FoodID", spi."Quantity", spi."MealType"
             FROM "Saved_Plan_Items" spi
             WHERE spi."PlanID" = $2`,
            [mealPlanId, planId]
        );

        await client.query('COMMIT');
        await logActivity({
            userId: req.user.id,
            type: 'MEALPLAN_APPLIED',
            detail: `Applied saved plan ${planId} to ${date}`,
            meta: { planId, date }
        });
        return res.json({ message: 'Saved plan applied successfully', mealPlanId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Apply saved plan error:', err);
        return res.status(500).json({ message: 'Server Error' });
    } finally {
        client.release();
    }
};

module.exports = {
    createMealPlan,
    addFoodToMealPlan,
    getNutritionSummary,
    getWeeklySummary,
    getMealPlanByDate,
    deleteMealPlanEntry,
    replaceTodayWithSavedPlan
};
