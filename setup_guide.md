# Smart Meal Planner - Developer Setup Guide

Welcome! If you've just cloned this repository, follow these steps to get your local environment running.

## Prerequisites

1.  **Node.js**: Install the latest LTS version.
2.  **SQL Server**: Install SQL Server Express or Developer Edition.
3.  **ODBC Driver 17**: This is **CRITICAL**. The application uses this specific driver to connect to SQL Server.
    - [Download ODBC Driver 17 for SQL Server](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)

## Database Setup

1.  Open SQL Server Management Studio (SSMS).
2.  Connect to your local instance (usually `localhost\SQLEXPRESS`).
3.  Create a new database named `SmartMealPlanner`.
4.  Open `database/schema.sql` and execute it against the `SmartMealPlanner` database to create tables and seed initial data.

## Configuration

1.  Navigate to the `backend/` directory.
2.  Create a `.env` file from `.env.example`:
    ```bash
    cp .env.example .env
    ```
3.  Edit `backend/.env` and set `DB_SERVER` to match your local SQL Server instance name.
    - Common values: `localhost\SQLEXPRESS`, `(localdb)\MSSQLLocalDB`, or just your Computer Name.
    - Example: `DB_SERVER=YOUR-PC-NAME\SQLEXPRESS`

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

## Troubleshooting

If you see a "Database connection is down" error in the browser:
1.  Check the backend console logs.
2.  Run the diagnostic script:
    ```bash
    cd backend
    node test_connection.js
    ```
3.  Ensure your SQL Server services are running.
