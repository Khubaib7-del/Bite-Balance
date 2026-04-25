const { query } = require('../config/db');

const getUsers = async (req, res) => {
    try {
        const result = await query(
            'SELECT "UserID", "Username", "Email", "Role", "CreatedAt" FROM "Users" ORDER BY "CreatedAt" DESC'
        );
        return res.json(result.rows);
    } catch (err) {
        console.error('Get users error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const updateUser = async (req, res) => {
    const { username, email, role } = req.body;

    try {
        await query(
            'UPDATE "Users" SET "Username" = $1, "Email" = $2, "Role" = $3 WHERE "UserID" = $4',
            [username, email, role, req.params.id]
        );
        return res.json({ message: 'User updated' });
    } catch (err) {
        console.error('Update user error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        await query('DELETE FROM "Users" WHERE "UserID" = $1', [req.params.id]);
        return res.json({ message: 'User deleted' });
    } catch (err) {
        console.error('Delete user error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const createArticle = async (req, res) => {
    const { title, content, category } = req.body;

    try {
        await query(
            'INSERT INTO "Articles" ("Title", "Content", "Category") VALUES ($1, $2, $3)',
            [title, content, category]
        );
        return res.json({ message: 'Article created' });
    } catch (err) {
        console.error('Create article error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const getArticles = async (req, res) => {
    try {
        const result = await query('SELECT * FROM "Articles" ORDER BY "CreatedAt" DESC');
        return res.json(result.rows);
    } catch (err) {
        console.error('Get articles error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const deleteArticle = async (req, res) => {
    try {
        await query('DELETE FROM "Articles" WHERE "ArticleID" = $1', [req.params.id]);
        return res.json({ message: 'Article deleted' });
    } catch (err) {
        console.error('Delete article error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const getAdminCode = async (req, res) => {
    try {
        const result = await query(
            'SELECT "SettingValue" FROM "SystemSettings" WHERE "SettingKey" = $1',
            ['AdminRegistrationCode']
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Admin registration code not found' });
        }

        return res.json({ adminCode: result.rows[0].SettingValue });
    } catch (err) {
        console.error('Get admin code error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const updateAdminCode = async (req, res) => {
    const { adminCode } = req.body;

    try {
        await query(
            'UPDATE "SystemSettings" SET "SettingValue" = $1 WHERE "SettingKey" = $2',
            [adminCode, 'AdminRegistrationCode']
        );

        return res.json({ message: 'Admin registration code updated' });
    } catch (err) {
        console.error('Update admin code error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getUsers,
    updateUser,
    deleteUser,
    createArticle,
    getArticles,
    deleteArticle,
    getAdminCode,
    updateAdminCode
};
