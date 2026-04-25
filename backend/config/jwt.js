const jwt = require('jsonwebtoken');

const getJwtSecret = () => process.env.JWT_SECRET || 'change-this-in-production';

const signJwt = (payload, options = { expiresIn: '1d' }) => {
    return jwt.sign(payload, getJwtSecret(), options);
};

const verifyJwt = (token) => {
    return jwt.verify(token, getJwtSecret());
};

module.exports = {
    signJwt,
    verifyJwt,
    getJwtSecret
};
