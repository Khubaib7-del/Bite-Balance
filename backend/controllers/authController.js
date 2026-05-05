const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query } = require('../config/db');
const { logActivity } = require('../utils/activity');
const { signJwt } = require('../config/jwt');

const buildUserPayload = (user) => ({
    id: user.UserID,
    username: user.Username,
    email: user.Email,
    role: user.Role
});

const generateAdminVerificationCode = () => {
    return String(crypto.randomInt(100000, 1000000));
};

const register = async (req, res) => {
    const { username, email, password, adminCode } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email and password are required' });
    }

    try {
        let role = 'USER';
        if (adminCode) {
            const settingsResult = await query(
                'SELECT "SettingValue" FROM "SystemSettings" WHERE "SettingKey" = $1',
                ['AdminRegistrationCode']
            );

            if (settingsResult.rowCount > 0 && settingsResult.rows[0].SettingValue === adminCode) {
                role = 'ADMIN';
            } else {
                return res.status(400).json({ message: 'Invalid admin secret code' });
            }
        }

        const existingUserResult = await query(
            'SELECT * FROM "Users" WHERE "Email" = $1',
            [email]
        );

        if (existingUserResult.rowCount > 0) {
            const existingUser = existingUserResult.rows[0];

            if (role === 'ADMIN' && existingUser.Role === 'USER') {
                await query(
                    'UPDATE "Users" SET "Role" = $1 WHERE "UserID" = $2',
                    ['ADMIN', existingUser.UserID]
                );

                await logActivity({
                    userId: existingUser.UserID,
                    type: 'ADMIN_UPGRADED',
                    detail: 'User upgraded to admin via registration code'
                });

                return res.status(200).json({
                    message: 'Account successfully upgraded to Administrative status. You can now login via the Admin Portal.'
                });
            }

            return res.status(400).json({ message: 'User already exists' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const insertResult = await query(
            'INSERT INTO "Users" ("Username", "Email", "PasswordHash", "Role") VALUES ($1, $2, $3, $4) RETURNING "UserID"',
            [username, email, passwordHash, role]
        );

        await logActivity({
            userId: insertResult.rows[0].UserID,
            type: 'USER_REGISTERED',
            detail: `Registered as ${role}`
        });

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration Error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await query(
            'SELECT * FROM "Users" WHERE "Email" = $1',
            [email]
        );

        if (result.rowCount === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (user.Role === 'ADMIN') {
            return res.status(403).json({ message: 'Administrative account detected. Please use the Admin Login Portal.' });
        }

        const token = signJwt({
            user: {
                id: user.UserID,
                role: user.Role
            }
        });

        await logActivity({
            userId: user.UserID,
            type: 'USER_LOGIN',
            detail: 'User login successful'
        });

        return res.json({
            token,
            user: buildUserPayload(user)
        });
    } catch (err) {
        console.error('Login Error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await query(
            'SELECT * FROM "Users" WHERE "Email" = $1',
            [email]
        );

        if (result.rowCount === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];
        if (user.Role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied: Not an administrative account' });
        }

        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = signJwt({
            user: {
                id: user.UserID,
                role: user.Role
            }
        });

        await logActivity({
            userId: user.UserID,
            type: 'ADMIN_LOGIN',
            detail: 'Admin login successful'
        });

        return res.json({
            token,
            user: buildUserPayload(user)
        });
    } catch (err) {
        console.error('Admin Login Error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const verifyCode = async (req, res) => {
    const { email, code } = req.body;

    try {
        const result = await query(
            'SELECT * FROM "Users" WHERE "Email" = $1',
            [email]
        );

        if (result.rowCount === 0) {
            return res.status(400).json({ message: 'Invalid account' });
        }

        const user = result.rows[0];

        if (!user.VerificationCode || user.VerificationCode !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        if (!user.CodeExpires || new Date(user.CodeExpires) < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired' });
        }

        await query(
            'UPDATE "Users" SET "VerificationCode" = NULL, "CodeExpires" = NULL WHERE "UserID" = $1',
            [user.UserID]
        );

        const token = signJwt({
            user: {
                id: user.UserID,
                role: user.Role
            }
        });

        await logActivity({
            userId: user.UserID,
            type: 'ADMIN_LOGIN',
            detail: 'Admin verification successful'
        });

        return res.json({
            token,
            user: buildUserPayload(user)
        });
    } catch (err) {
        console.error('Verification Error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    register,
    login,
    adminLogin,
    verifyCode
};
