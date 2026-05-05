# Bite Balance System

A professional web application for meal planning and nutrition tracking.

## Tech Stack
- **Frontend**: React.js, Tailwind CSS, Recharts, Lucide React
- **Backend**: Node.js, Express.js, JWT, PostgreSQL
- **Database**: PostgreSQL

## Project Structure
```
smart-meal-planner/
├── backend/            # Express.js API
│   ├── config/         # Database + JWT config
│   ├── controllers/    # Route handlers
│   ├── middleware/     # JWT authentication
│   ├── routes/         # API endpoints
│   └── server.js       # Entry point
├── frontend/           # React SPA
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Application pages
│   │   ├── services/   # Axios API calls
│   │   └── styles/     # Tailwind CSS
├── database/           # SQL scripts
│   └── schema.sql      # MS SQL Schema and seed data
└── .env                # (To be created) Environment variables
```

## Local Development Guide

To run this application locally, you should use two separate terminals (or a split terminal in VS Code).

### 1. Backend (Server)
1. Open a terminal and navigate to the backend folder:
   ```powershell
   cd smart-meal-planner\backend
   ```
2. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```
   *Note: Ensure your PostgreSQL server is running and `backend/.env` is configured.*

### 2. Frontend (React App)
1. Open a **second** terminal and navigate to the frontend folder:
   ```powershell
   cd smart-meal-planner\frontend
   ```
2. Start the React application:
   ```bash
   npm install
   npm start
   ```
   *The app will automatically open at `http://localhost:3000` (or `3002` if port 3000 is busy).*

## Hosting & Deployment (Vercel)

This project can be deployed on Vercel as a single project (frontend + backend API). The backend expects a PostgreSQL database.

### Required Environment Variables
Set these in Vercel Project Settings:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `DB_ADMIN_DB` (optional, defaults to `postgres`)
- `NODE_ENV=production`

### Deploy Steps
1. Import the repository into Vercel.
2. Keep the root `vercel.json` as-is (it routes `/api/*` to the backend and serves the React build).
3. Set the environment variables above.
4. Trigger a deploy.

### Notes
- The backend auto-creates the database if it does not exist (requires permissions on `DB_ADMIN_DB`).
- The frontend uses `/api` as its base path, which matches the Vercel routing rules.

## Seed Admin (Optional)

You can create a local admin user with:

```bash
cd backend
set SEED_ADMIN_EMAIL=admin@example.com
set SEED_ADMIN_PASSWORD=StrongPasswordHere
set SEED_ADMIN_USERNAME=admin
npm run seed-admin
```


## API Documentation

### Auth
- `POST /api/auth/register`: Create a new user.
- `POST /api/auth/login`: Authenticate and receive JWT token.

### Foods
- `GET /api/foods`: Get all food items.
- `GET /api/foods/search?name=XYZ`: Search foods by name.
- `POST /api/foods`: Add new food (Protected).

### Meal Plan
- `POST /api/mealplan`: Create/Get meal plan ID for a date (Protected).
- `POST /api/mealplan/add-food`: Add food to plan (Protected).
- `POST /api/mealplan/apply-saved-plan`: Replace daily plan with saved template (Protected).
- `GET /api/mealplan/:date`: Get daily plan (Protected).
- `GET /api/mealplan/nutrition-summary/:date`: Get daily summary (Protected).
