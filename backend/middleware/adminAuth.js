const { verifyJwt } = require('../config/jwt');
const { query } = require('../config/db');

module.exports = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        const decoded = verifyJwt(token);

        const userResult = await query('SELECT "Role" FROM "Users" WHERE "UserID" = $1', [decoded.user.id]);
        if (userResult.rowCount === 0) {
            return res.status(401).json({ message: 'Account not found. Please log in again.' });
        }
        const role = userResult.rows[0].Role;
        
        // Strict role check
        if (role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied: Administrative privileges required' });
        }
        
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
