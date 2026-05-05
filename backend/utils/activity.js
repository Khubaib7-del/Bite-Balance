const { query } = require('../config/db');

const logActivity = async ({ userId, type, detail = null, meta = null }) => {
    try {
        await query(
            'INSERT INTO "UserActivity" ("UserID", "Type", "Detail", "Meta") VALUES ($1, $2, $3, $4::jsonb)',
            [userId || null, type, detail, meta ? JSON.stringify(meta) : null]
        );
    } catch (err) {
        console.error('Log activity error:', err.message);
    }
};

module.exports = {
    logActivity
};
