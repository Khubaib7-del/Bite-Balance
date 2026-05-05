const { query } = require('../config/db');
const { logActivity } = require('../utils/activity');

const getProfile = async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM "UserProfiles" WHERE "UserID" = $1',
            [req.user.id]
        );

        if (result.rowCount === 0) {
            return res.json({});
        }

        return res.json(result.rows[0]);
    } catch (err) {
        console.error('Get profile error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const upsertProfile = async (req, res) => {
    const { weight, height, age, gender, activityLevel, goal } = req.body;

    try {
        await query(
            `INSERT INTO "UserProfiles"
                ("UserID", "Weight", "Height", "Age", "Gender", "ActivityLevel", "Goal", "UpdatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
             ON CONFLICT ("UserID") DO UPDATE SET
                "Weight" = EXCLUDED."Weight",
                "Height" = EXCLUDED."Height",
                "Age" = EXCLUDED."Age",
                "Gender" = EXCLUDED."Gender",
                "ActivityLevel" = EXCLUDED."ActivityLevel",
                "Goal" = EXCLUDED."Goal",
                "UpdatedAt" = NOW()`,
            [req.user.id, weight, height, age, gender, activityLevel, goal]
        );

        await logActivity({
            userId: req.user.id,
            type: 'PROFILE_UPDATED',
            detail: 'Profile updated'
        });

        return res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Update profile error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const getNotifications = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const [summaryRes, profileRes, savedPlansRes] = await Promise.all([
            query(
                `SELECT
                    COALESCE(SUM(f."Calories" * mpf."Quantity"), 0) AS "TotalCalories",
                    COALESCE(SUM(f."Protein" * mpf."Quantity"), 0) AS "TotalProtein"
                 FROM "MealPlans" mp
                 JOIN "MealPlanFoods" mpf ON mp."MealPlanID" = mpf."MealPlanID"
                 JOIN "FoodItems" f ON mpf."FoodID" = f."FoodID"
                 WHERE mp."UserID" = $1 AND mp."Date" = $2`,
                [req.user.id, today]
            ),
            query('SELECT "UpdatedAt" FROM "UserProfiles" WHERE "UserID" = $1', [req.user.id]),
            query(
                'SELECT COUNT(*)::int AS count, MAX("CreatedAt") AS "LastSaved" FROM "Saved_Meal_Plans" WHERE "UserID" = $1',
                [req.user.id]
            )
        ]);

        const summary = summaryRes.rows[0] || { TotalCalories: 0, TotalProtein: 0 };
        const profileUpdatedAt = profileRes.rowCount > 0 ? profileRes.rows[0].UpdatedAt : null;
        const savedStats = savedPlansRes.rows[0] || { count: 0, LastSaved: null };

        const notifications = [];
        if (summary.TotalCalories > 0) {
            notifications.push({
                type: 'success',
                title: 'Meals logged today',
                description: `You logged ${Math.round(summary.TotalCalories)} kcal with ${Math.round(summary.TotalProtein)}g protein today.`,
                createdAt: new Date().toISOString()
            });
        } else {
            notifications.push({
                type: 'info',
                title: 'No meals logged yet',
                description: 'Start tracking your meals to unlock daily insights.',
                createdAt: new Date().toISOString()
            });
        }

        if (savedStats.count > 0) {
            notifications.push({
                type: 'success',
                title: 'Saved plans ready',
                description: `You have ${savedStats.count} saved plan${savedStats.count === 1 ? '' : 's'} to reuse.`,
                createdAt: savedStats.LastSaved || new Date().toISOString()
            });
        } else {
            notifications.push({
                type: 'info',
                title: 'Save your first plan',
                description: 'Save a daily plan to reuse it later with one click.',
                createdAt: new Date().toISOString()
            });
        }

        if (profileUpdatedAt) {
            notifications.push({
                type: 'success',
                title: 'Profile updated',
                description: 'Your health profile is synced and up to date.',
                createdAt: profileUpdatedAt
            });
        } else {
            notifications.push({
                type: 'warning',
                title: 'Complete your profile',
                description: 'Add your height, weight, and goals for better insights.',
                createdAt: new Date().toISOString()
            });
        }

        return res.json(notifications);
    } catch (err) {
        console.error('Get notifications error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getProfile,
    upsertProfile,
    getNotifications
};
