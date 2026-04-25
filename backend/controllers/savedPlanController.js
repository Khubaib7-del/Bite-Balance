const { getPool, query } = require('../config/db');

const savePlan = async (req, res) => {
    const { planName, items = [] } = req.body;

    if (!planName) {
        return res.status(400).json({ message: 'planName is required' });
    }

    const pool = await getPool();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const planResult = await client.query(
            'INSERT INTO "Saved_Meal_Plans" ("UserID", "PlanName") VALUES ($1, $2) RETURNING "PlanID"',
            [req.user.id, planName]
        );

        const planId = planResult.rows[0].PlanID;

        for (const item of items) {
            await client.query(
                'INSERT INTO "Saved_Plan_Items" ("PlanID", "FoodID", "Quantity", "MealType") VALUES ($1, $2, $3, $4)',
                [planId, item.FoodID, item.Quantity, item.MealType]
            );
        }

        await client.query('COMMIT');
        return res.json({ message: 'Plan saved successfully', planId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Save plan error:', err);
        return res.status(500).json({ message: 'Server Error' });
    } finally {
        client.release();
    }
};

const getSavedPlans = async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM "Saved_Meal_Plans" WHERE "UserID" = $1 ORDER BY "CreatedAt" DESC',
            [req.user.id]
        );
        return res.json(result.rows);
    } catch (err) {
        console.error('Get saved plans error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const getPlanDetails = async (req, res) => {
    try {
        const result = await query(
            `SELECT spi.*, f."FoodName", f."Calories", f."Protein", f."Carbohydrates", f."Fats"
             FROM "Saved_Plan_Items" spi
             JOIN "FoodItems" f ON spi."FoodID" = f."FoodID"
             JOIN "Saved_Meal_Plans" smp ON spi."PlanID" = smp."PlanID"
             WHERE spi."PlanID" = $1 AND smp."UserID" = $2`,
            [req.params.id, req.user.id]
        );
        return res.json(result.rows);
    } catch (err) {
        console.error('Get plan details error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const deletePlan = async (req, res) => {
    try {
        await query(
            'DELETE FROM "Saved_Meal_Plans" WHERE "PlanID" = $1 AND "UserID" = $2',
            [req.params.id, req.user.id]
        );
        return res.json({ message: 'Plan deleted' });
    } catch (err) {
        console.error('Delete plan error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    savePlan,
    getSavedPlans,
    getPlanDetails,
    deletePlan
};
