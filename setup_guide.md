# Smart Meal Planner - Developer Setup Guide

Welcome! If you've just cloned this repository, follow these steps to get your local environment running.

## Prerequisites

1.  **Node.js**: Install the latest LTS version.
2.  **SQL Server**: Install SQL Server Express or Developer Edition.
3.  **SQL Server Browser Service**: Ensure this service is **Running** and set to **Automatic**. (Essential for named instances like `SQLEXPRESS`).
4.  **ODBC Driver 17**: This is **CRITICAL**. The application uses this specific driver to connect to SQL Server.
    - [Download ODBC Driver 17 for SQL Server](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)

## Database Setup

1.  Open SQL Server Management Studio (SSMS).
2.  Connect to your local instance (usually `.\SQLEXPRESS`).
3.  Open `database/schema.sql`.
4.  Execute the script (Press **F5**). 
    - *Note: The script now automatically creates the `SmartMealPlanner` database for you.*

## Configuration

1.  Navigate to the `backend/` directory.
2.  Create a `.env` file from `.env.example`:
    ```bash
    cp .env.example .env
    ```
3.  Edit `backend/.env` and configure your database settings.
    -   **DB_SERVER**: The address of your SQL Server (e.g., `.\SQLEXPRESS`).
    -   **Authentication Choice**:
        -   **Windows Authentication (Default)**: Leave `DB_USER` and `DB_PASSWORD` as placeholders or empty. The app will automatically use a Trusted Connection.
        -   **SQL Server Authentication**: Set `DB_USER` (e.g., `sa`) and your `DB_PASSWORD`. The app will detect these and use SQL login.

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
1.  **Check SQL Server Browser**: Open `services.msc`, find **SQL Server Browser**, right-click -> **Start**. Set to **Automatic**.
2.  **Check Instance Name**: Ensure `DB_SERVER` in `.env` matches your instance (e.g., `DESKTOP-XXX\SQLEXPRESS`).
3.  **Check ODBC Driver**: Verify "ODBC Driver 17" is listed in your installed programs.
4.  **Run Diagnostics**:
    ```bash
    cd backend
    node test_connection.js
    ```
