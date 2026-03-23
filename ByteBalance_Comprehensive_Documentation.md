# ByteBalance: Comprehensive Project Documentation & Technical Report

**Project Name:** ByteBalance (Smart Meal Planner)  
**Target Audience:** Technical Evaluators (TAs), Stakeholders, and New Developers  
**Core Mission:** Empowering users through data-driven nutrition and personalized meal planning.

---

## 1. Executive Summary
ByteBalance is a state-of-the-art health and nutrition ecosystem. Unlike traditional meal trackers, ByteBalance focuses on aesthetic excellence, reactive user interfaces, and a robust administrative backend. It provides a seamless journey from user registration to complex nutritional analysis, all while maintaining high performance and security standards.

---

## 2. Core Product Features
The application is built around several key pillars that ensure a premium user experience:

*   **Dynamic Nutrition Dashboard:** A real-time visual summary of daily intake, goal progress, and weekly health trends.
*   **Intelligent Meal Planner:** A highly interactive interface for designing breakfast, lunch, dinner, and snack routines.
*   **Global Food Database:** An integrated search system covering thousands of food items with detailed macronutrient data.
*   **Admin Power Portal:** A restricted area for managing user accounts, system configuration, and health articles.
*   **Health Journey Tools:** Specialized calculators (BMI, Macro ratios) and profile management to tailor the app to individual needs.

---

## 3. Technical Architecture (The Stack)
We leveraged a modern "MERN-style" stack, replacing traditional MongoDB with MS SQL Server for enterprise-grade relational data management.

| Layer | Component | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19 | The bedrock of the reactive UI. |
| **Backend** | Node.js & Express | A lightweight, fast REST API. |
| **Database** | MS SQL Server | Relational storage using T-SQL. |
| **Styling** | Vanilla CSS + Bootstrap | Clean, custom professional aesthetics. |
| **Animations** | Framer Motion | Smooth, spring-based transitions. |
| **Visuals** | Three.js & Lucide | immersive backgrounds and vector icons. |

---

## 4. Frontend Deep Dive

### 4.1 Page Architecture
Each page is a self-contained module managing its own state and side effects through React Hooks (`useState`, `useEffect`).

1.  **Dashboard (`Dashboard.jsx`):** 
    *   **Logic:** Aggregates data from multiple endpoints (Summary, Plan, Weekly) using `Promise.all` for optimal performance.
    *   **Visualization:** Uses `recharts` for SVG-based Area and Bar charts.
    *   **Aesthetics:** Implements SVG Gaussian Blur filters for high-end "glow" effects on charts.
2.  **Meal Planner (`MealPlanner.jsx`):** 
    *   **Interaction:** Features a drag-and-drop-style UI for adding foods to specific meal slots.
    *   **Modals:** Uses a dedicated search modal with real-time filtering and quantity adjustment logic.
3.  **Auth Portal (`AuthPage.jsx`):** 
    *   **UX:** A unified login/register component with smooth perspective-shift animations between states.

### 4.2 Styling Philosophy
We moved away from generic utility frameworks to **Custom CSS Variables (Tokens)**. This allows for:
*   **Theme Consistency:** Centrally managed colors (e.g., `--bb-emerald-500`) and gradients.
*   **Premium Blurs:** Heavy use of `backdrop-filter: blur()` and transparent overlays for a "glassmorphism" look.

---

## 5. Backend Deep Dive

### 5.1 API Infrastructure
The server is built on **Express**, optimized for handling JSON payloads and stateless communication.

*   **Request Interceptors:** The frontend uses an Axios interceptor to automatically inject JWT tokens from `localStorage` into Every outgoing request.
*   **Static Serving:** The backend is configured to serve the production build of the frontend, making it a "Full Stack" single-executable deployment.

### 5.2 Key Routes
- `/api/auth`: Registration, Login (User/Admin), and Passkey Verification.
- `/api/foods`: CRUD operations and complex pattern matching for food searches.
- `/api/mealplan`: Logic for calculating daily calorie totals and junction table management.
- `/api/admin`: High-privilege operations guarded by dual-layer middleware.

---

## 6. Database Design (Relational Model)
The database uses a normalized schema to ensure data integrity.

*   **Users Table:** Stores credentials, roles, and security codes.
*   **UserProfiles Table:** (1-to-1 with Users) Stores persistent physical data for nutritional calculations.
*   **FoodItems Table:** The central repository for nutritional facts.
*   **MealPlans & MealPlanFoods:** A classic 1-to-Many / Many-to-Many relationship structure using junction tables to track what users eat and when.
*   **SystemSettings:** A Key-Value store for global overrides (like the dynamic Admin registration code).

---

## 7. Security & Authentication flow

### 7.1 JWT Implementation
We use industry-standard **JSON Web Tokens**.
1.  **Issuance:** Upon successful login, the server signs a payload containing the UserID and Role.
2.  **Verification:** Managed by the `auth` middleware, which decodes the token and attaches the user data to the request object.

### 7.2 The Admin "Secure Passkey" System
For extra security, we implemented a custom 2-Factor-style logic:
1.  Admin enters correct password.
2.  Server sends back a `requiresVerification` flag.
3.  User must enter the current system passkey (Default: `ADMIN789`).
4.  Only after this step is the final JWT issued.

---

## 8. Setup & Development Guide
To get this project running on any machine:

1.  **Prerequisites:** Node.js, SQL Server, and **ODBC Driver 17 for SQL Server**.
2.  **Database Initial:** Run `database/schema.sql` to build the entire environment.
3.  **Env Config:** Copy `.env.example` to `.env` and set `DB_SERVER` to your local instance.
4.  **Launch:**
    ```bash
    cd backend && npm run dev
    cd frontend && npm start
    ```
5.  **Diagnostic Tool:** Run `node backend/test_connection.js` to automatically verify your SQL Server setup.

---

## 9. Conclusion
ByteBalance represents a perfect blend of modern frontend artistry and solid backend engineering. It is fully prepared for evaluation, featuring clean code, professional documentation, and robust error handling. 

**Note to User:** You can copy this Markdown content directly into a Word document or use a tool like "Pandoc" to convert it. It is formatted to look professional and structured for a high-level academic or technical presentation.
