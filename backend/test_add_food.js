const { poolPromise, sql } = require('./config/db');

async function testAddFood() {
    try {
        const pool = await poolPromise;
        console.log('Connected to DB');

        // 1. Get or create a user id (using first user)
        const userRes = await pool.request().query('SELECT TOP 1 UserID FROM Users');
        if (userRes.recordset.length === 0) {
            console.error('No users found. Please register first.');
            process.exit(1);
        }
        const userId = userRes.recordset[0].UserID;
        console.log('Using UserID:', userId);

        // 2. Get or create a food id (using first food)
        const foodRes = await pool.request().query('SELECT TOP 1 FoodID FROM FoodItems');
        if (foodRes.recordset.length === 0) {
            console.error('No foods found. Please seed database.');
            process.exit(1);
        }
        const foodId = foodRes.recordset[0].FoodID;
        console.log('Using FoodID:', foodId);

        // 3. Create a meal plan for today
        const today = new Date().toISOString().split('T')[0];
        console.log('Using Date:', today);

        let mealPlanId;
        const mpCheck = await pool.request()
            .input('uid', sql.INT, userId)
            .input('date', sql.DATE, today)
            .query('SELECT MealPlanID FROM MealPlans WHERE UserID = @uid AND Date = @date');

        if (mpCheck.recordset.length > 0) {
            mealPlanId = mpCheck.recordset[0].MealPlanID;
            console.log('Found existing MealPlanID:', mealPlanId);
        } else {
            const mpInsert = await pool.request()
                .input('uid', sql.INT, userId)
                .input('date', sql.DATE, today)
                .query('INSERT INTO MealPlans (UserID, Date) OUTPUT INSERTED.MealPlanID VALUES (@uid, @date)');
            mealPlanId = mpInsert.recordset[0].MealPlanID;
            console.log('Created new MealPlanID:', mealPlanId);
        }

        // 4. Try to add food
        console.log('Attempting to insert into MealPlanFoods...');
        await pool.request()
            .input('mpId', sql.INT, mealPlanId)
            .input('fId', sql.INT, foodId)
            .input('qty', sql.FLOAT, 1)
            .input('type', sql.NVARCHAR(20), 'Lunch')
            .query('INSERT INTO MealPlanFoods (MealPlanID, FoodID, Quantity, MealType) VALUES (@mpId, @fId, @qty, @type)');

        console.log('SUCCESS: Food added to meal plan!');
        process.exit(0);
    } catch (err) {
        console.error('FAILURE: Error adding food:', err.message);
        if (err.stack) console.error(err.stack);
        process.exit(1);
    }
}

testAddFood();
