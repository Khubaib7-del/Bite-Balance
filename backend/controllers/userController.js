const { query } = require('../config/db');

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

        return res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Update profile error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getProfile,
    upsertProfile
};
