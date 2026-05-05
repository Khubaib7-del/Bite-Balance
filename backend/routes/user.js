const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/profile', auth, userController.getProfile);
router.post('/profile', auth, userController.upsertProfile);
router.get('/notifications', auth, userController.getNotifications);

module.exports = router;
