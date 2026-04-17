const express = require('express');
const router = express.Router();
const mealplanController = require('../controllers/mealplanController');
const auth = require('../middleware/auth');

router.post('/', auth, mealplanController.createMealPlan);
router.post('/add-food', auth, mealplanController.addFoodToMealPlan);
router.post('/apply-saved-plan', auth, mealplanController.replaceTodayWithSavedPlan);
router.get('/nutrition-summary/:date', auth, mealplanController.getNutritionSummary);
router.get('/weekly-summary', auth, mealplanController.getWeeklySummary);
router.get('/:date', auth, mealplanController.getMealPlanByDate);
router.delete('/entry/:entryId', auth, mealplanController.deleteMealPlanEntry);

module.exports = router;
