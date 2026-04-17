const { Pool, Client } = require('pg');
require('dotenv').config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = Number(process.env.DB_PORT || 5432);
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = String(process.env.DB_PASSWORD ?? 'postgres');
const dbName = process.env.DB_NAME || process.env.DB_DATABASE || 'SmartMealPlanner';
const adminDbName = process.env.DB_ADMIN_DB || 'postgres';

if (!process.env.DB_PASSWORD) {
    console.warn('[DB] DB_PASSWORD is not set. Using fallback password. Add a real value in backend/.env.');
}

let pool = null;
let initPromise = null;

const baseConfig = {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword
};

const ensureDatabaseExists = async () => {
    const adminClient = new Client({
        ...baseConfig,
        database: adminDbName
    });

    await adminClient.connect();
    try {
        const existing = await adminClient.query(
            'SELECT 1 FROM pg_database WHERE datname = $1',
            [dbName]
        );

        if (existing.rowCount === 0) {
            const safeName = dbName.replace(/"/g, '""');
            await adminClient.query(`CREATE DATABASE "${safeName}"`);
            console.log(`[DB] Created database: ${dbName}`);
        }
    } finally {
        await adminClient.end();
    }
};

const initDb = async () => {
    if (pool) return pool;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        await ensureDatabaseExists();

        pool = new Pool({
            ...baseConfig,
            database: dbName,
            max: 10,
            idleTimeoutMillis: 30000
        });

        await pool.query('SELECT 1');
        console.log(`[DB] Connected to PostgreSQL at ${dbHost}:${dbPort}/${dbName}`);
        return pool;
    })().catch((err) => {
        console.error('[DB] Connection/init failed:', err.message);
        pool = null;
        initPromise = null;
        throw err;
    });

    return initPromise;
};

const getPool = async () => {
    const resolvedPool = await initDb();
    if (!resolvedPool) {
        throw new Error('Database connection is not available. Check server logs.');
    }
    return resolvedPool;
};

const query = async (text, params = []) => {
    const resolvedPool = await getPool();
    return resolvedPool.query(text, params);
};

module.exports = {
    initDb,
    getPool,
    query
};
