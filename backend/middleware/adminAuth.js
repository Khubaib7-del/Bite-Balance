const { verifyJwt } = require('../config/jwt');

module.exports = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        const decoded = verifyJwt(token);
        
        // Strict role check
        if (decoded.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied: Administrative privileges required' });
        }
        
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
