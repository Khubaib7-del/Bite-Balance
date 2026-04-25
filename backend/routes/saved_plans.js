const express = require('express');
const router = express.Router();
const savedPlanController = require('../controllers/savedPlanController');
const auth = require('../middleware/auth');

router.post('/', auth, savedPlanController.savePlan);
router.get('/', auth, savedPlanController.getSavedPlans);
router.get('/:id', auth, savedPlanController.getPlanDetails);
router.delete('/:id', auth, savedPlanController.deletePlan);

module.exports = router;
