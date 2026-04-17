const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const { initDb } = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/foods', require('./routes/foods'));
app.use('/api/mealplan', require('./routes/mealplans'));
app.use('/api/saved-plans', require('./routes/saved_plans'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/user', require('./routes/user'));

app.get('/api/health', async (req, res) => {
    try {
        await initDb();
        return res.json({ ok: true, message: 'API is healthy' });
    } catch (err) {
        return res.status(503).json({ ok: false, message: 'Database unavailable' });
    }
});

const PORT = process.env.PORT || 5000;
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

const startServer = async () => {
    try {
        await initDb();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to initialize server:', err.message);
        process.exit(1);
    }
};

startServer();
