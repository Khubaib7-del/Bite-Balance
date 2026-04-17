const { query } = require('../config/db');

module.exports = async function (req, res, next) {
    try {
        const result = await query(
            'SELECT "Role" FROM "Users" WHERE "UserID" = $1',
            [req.user.id]
        );

        if (result.rowCount > 0 && result.rows[0].Role === 'ADMIN') {
            next();
        } else {
            return res.status(403).json({ message: 'Access denied: Admin only' });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Server Error' });
    }
};
