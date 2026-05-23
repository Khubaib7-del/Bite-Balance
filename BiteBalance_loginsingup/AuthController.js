/*
    Bite Balance - Authentication Controller
    Business Logic Tier (2nd Tier)
    Maps to the ".aspx.cs" requirement.
    Handles user input validation, hashing, and response formatting.
*/

const bcrypt = require('bcryptjs');
const DAL = require('./DAL');

/**
 * Handles the Signup Request
 */
const handleSignup = async (req, res) => {
    const { username, email, password } = req.body;

    // 1. Basic Front-end style validation (on the backend for safety)
    if (!username || !email || !password) {
        return res.status(400).json({ status: 'Error', message: 'All fields are required.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ status: 'Error', message: 'Password must be at least 6 characters.' });
    }

    try {
        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Call DAL to execute Stored Procedure
        const result = await DAL.registerUserDAL(username, email, passwordHash, 'USER');

        // result contains { p_user_id, p_message } from the SP OUT parameters
        if (result.p_message.startsWith('Success')) {
            return res.status(201).json({ 
                status: 'Success', 
                message: result.p_message,
                userId: result.p_user_id 
            });
        } else {
            return res.status(400).json({ 
                status: 'Error', 
                message: result.p_message 
            });
        }
    } catch (err) {
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
    }
};

/**
 * Handles the Login Request
 */
const handleLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ status: 'Error', message: 'Email and password are required.' });
    }

    try {
        // 1. Get user from DAL
        const user = await DAL.validateLoginDAL(email);

        if (!user) {
            return res.status(401).json({ status: 'Error', message: 'Invalid credentials.' });
        }

        // 2. Check Password
        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            return res.status(401).json({ status: 'Error', message: 'Invalid credentials.' });
        }

        // 3. Success - Redirect Logic (Front-end will handle the actual redirect)
        return res.status(200).json({
            status: 'Success',
            message: 'Login successful.',
            user: {
                id: user.UserID,
                username: user.Username,
                role: user.Role
            }
        });

    } catch (err) {
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
    }
};

module.exports = {
    handleSignup,
    handleLogin
};
