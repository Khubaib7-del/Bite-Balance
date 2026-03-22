const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth', require('./routes/forgot_password'));
app.use('/api/foods', require('./routes/foods'));
app.use('/api/mealplan', require('./routes/mealplans'));
app.use('/api/saved-plans', require('./routes/saved_plans'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/user', require('./routes/user'));

const PORT = process.env.PORT || 5000;

const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
