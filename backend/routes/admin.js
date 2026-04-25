const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/users', auth, admin, adminController.getUsers);
router.put('/users/:id', auth, admin, adminController.updateUser);
router.delete('/users/:id', auth, admin, adminController.deleteUser);

router.post('/articles', auth, admin, adminController.createArticle);
router.get('/articles', adminController.getArticles);
router.delete('/articles/:id', auth, admin, adminController.deleteArticle);

router.get('/settings/admin-code', auth, admin, adminController.getAdminCode);
router.put('/settings/admin-code', auth, admin, adminController.updateAdminCode);

module.exports = router;
