const { verifyJwt } = require('../config/jwt');

module.exports = (req, res, next) => {
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
        req.user = decoded.user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
};
