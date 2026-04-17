const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const userResult = await query(
            'SELECT "UserID" FROM "Users" WHERE "Email" = $1',
            [email]
        );

        if (userResult.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userId = userResult.rows[0].UserID;
        const token = crypto.randomBytes(24).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await query(
            'INSERT INTO "Password_Resets" ("UserID", "Token", "ExpiresAt") VALUES ($1, $2, $3)',
            [userId, token, expiresAt]
        );

        console.log(`Reset token for ${email}: ${token}`);

        return res.json({ message: 'Password reset token generated (Check server logs)' });
    } catch (err) {
        console.error('Forgot Password Error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const resetPassword = async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;

    try {
        const resetResult = await query(
            'SELECT * FROM "Password_Resets" WHERE "Token" = $1 AND "ExpiresAt" > NOW()',
            [token]
        );

        if (resetResult.rowCount === 0) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const userId = resetResult.rows[0].UserID;
        const passwordHash = await bcrypt.hash(password, 10);

        await query(
            'UPDATE "Users" SET "PasswordHash" = $1 WHERE "UserID" = $2',
            [passwordHash, userId]
        );

        await query(
            'DELETE FROM "Password_Resets" WHERE "Token" = $1',
            [token]
        );

        return res.json({ message: 'Password has been reset' });
    } catch (err) {
        console.error('Reset Password Error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    forgotPassword,
    resetPassword
};
