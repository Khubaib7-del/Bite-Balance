const { verifyJwt } = require('../config/jwt');
const { query } = require('../config/db');

module.exports = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = verifyJwt(token);
        const userResult = await query('SELECT 1 FROM "Users" WHERE "UserID" = $1', [decoded.user.id]);
        if (userResult.rowCount === 0) {
            return res.status(401).json({ message: 'Account not found. Please log in again.' });
        }

        req.user = decoded.user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
};
