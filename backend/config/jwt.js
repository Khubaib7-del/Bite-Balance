const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET is required in production');
        }
        console.warn('[AUTH] JWT_SECRET is not set. Using a development fallback.');
    }

    return process.env.JWT_SECRET || 'change-this-in-production';
};

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
