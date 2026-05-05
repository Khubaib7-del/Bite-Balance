# Smart Meal Planner - Developer Setup Guide

Welcome! If you've just cloned this repository, follow these steps to get your local environment running.

## Prerequisites

1.  **Node.js**: Install the latest LTS version.
2.  **PostgreSQL**: Install PostgreSQL 14+ and keep the server running.
3.  **pgAdmin** or **psql CLI**: Use pgAdmin Query Tool or psql to run `database/schema.sql`.

## Database Setup

1.  Create the `SmartMealPlanner` database in pgAdmin.
2.  Select the database and open Query Tool.
3.  Open `database/schema.sql` and run it.
    - *Note: This creates tables and seed data in the selected database.*

## Configuration

1.  Navigate to the `backend/` directory.
2.  Create a `.env` file from `.env.example`:
    ```bash
    cp .env.example .env
    ```
3.  Edit `backend/.env` and configure your database settings.
    -   **DB_HOST**: PostgreSQL host (usually `localhost`).
    -   **DB_PORT**: PostgreSQL port (usually `5432`).
    -   **DB_USER**: PostgreSQL username (usually `postgres`).
    -   **DB_PASSWORD**: PostgreSQL password.
    -   **DB_NAME**: Target application database (e.g., `SmartMealPlanner`).


## Running the Application

1.  **Backend**:
    ```bash
    cd backend
    npm install
    npm run dev
    ```
2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm start
    ```

## Seed Admin User (Optional)

Run this once after setting your backend `.env`:

```bash
cd backend
set SEED_ADMIN_EMAIL=admin@example.com
set SEED_ADMIN_PASSWORD=StrongPasswordHere
set SEED_ADMIN_USERNAME=admin
npm run seed-admin
```

## Troubleshooting

If you see a "Database connection is down" error in the browser:
1.  **Check PostgreSQL Service**: Ensure postgres service is running.
2.  **Check Credentials**: Confirm `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_PASSWORD` are correct in `.env`.
3.  **Check DB Creation Rights**: Your `DB_USER` should have permission to create `DB_NAME` if it does not already exist.
4.  **Run Diagnostics**:
    ```bash
    cd backend
    node test_connection.js
    ```
