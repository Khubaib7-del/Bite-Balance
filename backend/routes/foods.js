const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const auth = require('../middleware/auth');

router.get('/', foodController.getAllFoods);
router.get('/search', foodController.searchFoods);
router.post('/', auth, foodController.addFood);
router.put('/:id', auth, foodController.updateFood);
router.delete('/:id', auth, foodController.deleteFood);

module.exports = router;
