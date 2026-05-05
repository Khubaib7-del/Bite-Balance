const bcrypt = require('bcryptjs');
const { initDb, query } = require('../config/db');

const seedAdmin = async () => {
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    const username = process.env.SEED_ADMIN_USERNAME || (email ? email.split('@')[0] : null);

    if (!email || !password) {
        console.error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required.');
        process.exit(1);
    }

    if (!username) {
        console.error('SEED_ADMIN_USERNAME could not be derived. Provide it explicitly.');
        process.exit(1);
    }

    await initDb();

    const existing = await query('SELECT "UserID", "Role" FROM "Users" WHERE "Email" = $1', [email]);
    if (existing.rowCount > 0) {
        if (existing.rows[0].Role !== 'ADMIN') {
            await query('UPDATE "Users" SET "Role" = $1 WHERE "UserID" = $2', ['ADMIN', existing.rows[0].UserID]);
            console.log('Existing user upgraded to ADMIN.');
        } else {
            console.log('Admin user already exists.');
        }
        process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await query(
        'INSERT INTO "Users" ("Username", "Email", "PasswordHash", "Role") VALUES ($1, $2, $3, $4)',
        [username, email, passwordHash, 'ADMIN']
    );

    console.log('Admin user created.');
    process.exit(0);
};

seedAdmin().catch((err) => {
    console.error('Seed admin failed:', err.message);
    process.exit(1);
});
