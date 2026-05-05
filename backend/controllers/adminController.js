const { query } = require('../config/db');
const { logActivity } = require('../utils/activity');

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
        await logActivity({
            userId: req.user.id,
            type: 'ADMIN_USER_UPDATED',
            detail: `Updated user ${username || email || req.params.id}`,
            meta: { targetUserId: req.params.id, role }
        });
        return res.json({ message: 'User updated' });
    } catch (err) {
        console.error('Update user error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        await query('DELETE FROM "Users" WHERE "UserID" = $1', [req.params.id]);
        await logActivity({
            userId: req.user.id,
            type: 'ADMIN_USER_DELETED',
            detail: `Deleted user ${req.params.id}`,
            meta: { targetUserId: req.params.id }
        });
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
        await logActivity({
            userId: req.user.id,
            type: 'ARTICLE_CREATED',
            detail: title,
            meta: { category }
        });
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
        await logActivity({
            userId: req.user.id,
            type: 'ARTICLE_DELETED',
            detail: `Deleted article ${req.params.id}`,
            meta: { articleId: req.params.id }
        });
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

        await logActivity({
            userId: req.user.id,
            type: 'ADMIN_CODE_UPDATED',
            detail: 'Admin registration code updated'
        });

        return res.json({ message: 'Admin registration code updated' });
    } catch (err) {
        console.error('Update admin code error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const getActivity = async (req, res) => {
    try {
        const result = await query(
            `SELECT
                ua."ActivityID",
                ua."Type",
                ua."Detail",
                ua."CreatedAt",
                u."Username" AS "Actor"
             FROM "UserActivity" ua
             LEFT JOIN "Users" u ON ua."UserID" = u."UserID"
             ORDER BY ua."CreatedAt" DESC
             LIMIT 50`
        );

        return res.json(result.rows);
    } catch (err) {
        console.error('Get activity error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const getSystemStatus = async (req, res) => {
    try {
        await query('SELECT 1');

        const [usersRes, foodsRes, plansRes, savedPlansRes] = await Promise.all([
            query('SELECT COUNT(*)::int AS count FROM "Users"'),
            query('SELECT COUNT(*)::int AS count FROM "FoodItems"'),
            query('SELECT COUNT(*)::int AS count FROM "MealPlans"'),
            query('SELECT COUNT(*)::int AS count FROM "Saved_Meal_Plans"')
        ]);

        return res.json({
            api: { status: 'Operational' },
            database: { status: 'Connected' },
            metrics: {
                users: usersRes.rows[0].count,
                foods: foodsRes.rows[0].count,
                mealPlans: plansRes.rows[0].count,
                savedPlans: savedPlansRes.rows[0].count
            }
        });
    } catch (err) {
        console.error('Get system status error:', err);
        return res.status(503).json({ message: 'System unavailable' });
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
    updateAdminCode,
    getActivity,
    getSystemStatus
};
