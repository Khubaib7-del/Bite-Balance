const { query } = require('../config/db');

const getAllFoods = async (req, res) => {
    try {
        const result = await query('SELECT * FROM "FoodItems" ORDER BY "FoodID" ASC');
        return res.json(result.rows);
    } catch (err) {
        console.error('Get foods error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const searchFoods = async (req, res) => {
    const { name = '' } = req.query;

    try {
        const result = await query(
            'SELECT * FROM "FoodItems" WHERE "FoodName" ILIKE $1 ORDER BY "FoodName" ASC',
            [`%${name}%`]
        );
        return res.json(result.rows);
    } catch (err) {
        console.error('Search foods error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const addFood = async (req, res) => {
    const { FoodName, Calories = 0, Protein = 0, Carbohydrates = 0, Fats = 0, ImagePath = null } = req.body;

    if (!FoodName) {
        return res.status(400).json({ message: 'FoodName is required' });
    }

    try {
        const result = await query(
            'INSERT INTO "FoodItems" ("FoodName", "Calories", "Protein", "Carbohydrates", "Fats", "ImagePath") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [FoodName, Calories, Protein, Carbohydrates, Fats, ImagePath]
        );

        return res.status(201).json({ message: 'Food item added', item: result.rows[0] });
    } catch (err) {
        console.error('Add food error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const updateFood = async (req, res) => {
    const { id } = req.params;
    const { FoodName, Calories = 0, Protein = 0, Carbohydrates = 0, Fats = 0, ImagePath = null } = req.body;

    try {
        const result = await query(
            'UPDATE "FoodItems" SET "FoodName" = $1, "Calories" = $2, "Protein" = $3, "Carbohydrates" = $4, "Fats" = $5, "ImagePath" = $6 WHERE "FoodID" = $7 RETURNING *',
            [FoodName, Calories, Protein, Carbohydrates, Fats, ImagePath, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        return res.json({ message: 'Food item updated', item: result.rows[0] });
    } catch (err) {
        console.error('Update food error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

const deleteFood = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query(
            'DELETE FROM "FoodItems" WHERE "FoodID" = $1 RETURNING "FoodID"',
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        return res.json({ message: 'Food item deleted' });
    } catch (err) {
        console.error('Delete food error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAllFoods,
    searchFoods,
    addFood,
    updateFood,
    deleteFood
};
