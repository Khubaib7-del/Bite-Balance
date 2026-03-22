# Bite Balance System

A professional web application for meal planning and nutrition tracking.

## Tech Stack
- **Frontend**: React.js, Tailwind CSS, Recharts, Lucide React
- **Backend**: Node.js, Express.js, JWT, MS SQL Server
- **Database**: Microsoft SQL Server

## Project Structure
```
smart-meal-planner/
├── backend/            # Express.js API
│   ├── config/         # Database connection
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
2. Start the development server:
   ```bash
   npm run dev
   ```
   *Note: Ensure your local MS SQL Server (SQLEXPRESS) is running.*

### 2. Frontend (React App)
1. Open a **second** terminal and navigate to the frontend folder:
   ```powershell
   cd smart-meal-planner\frontend
   ```
2. Start the React application:
   ```bash
   npm start
   ```
   *The app will automatically open at `http://localhost:3000` (or `3002` if port 3000 is busy).*

## Hosting & Deployment
Because the backend uses a local MS SQL database, traditional hosting like Vercel requires some additional steps. See the [Hosting Guide](file:///C:/Users/T%20L%20S/.gemini/antigravity/brain/55386a65-2e1b-439f-b352-ba96a0a955cd/hosting_guide.md) for full details.

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
- `GET /api/mealplan/:date`: Get daily plan (Protected).
- `GET /api/mealplan/nutrition-summary/:date`: Get daily summary (Protected).
