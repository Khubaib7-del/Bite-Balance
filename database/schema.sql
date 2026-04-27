/*
  Smart Meal Planner System - Database Schema (PostgreSQL)
  Run with psql so that \gexec and \connect commands are supported.
*/

SELECT 'CREATE DATABASE "SmartMealPlanner"'
WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'SmartMealPlanner'
)\gexec

\connect "SmartMealPlanner"

CREATE TABLE IF NOT EXISTS "Users" (
    "UserID" SERIAL PRIMARY KEY,
    "Username" VARCHAR(50) NOT NULL UNIQUE,
    "Email" VARCHAR(100) NOT NULL UNIQUE,
    "PasswordHash" TEXT NOT NULL,
    "Role" VARCHAR(20) DEFAULT 'USER',
    "VerificationCode" VARCHAR(10) NULL,
    "CodeExpires" TIMESTAMP NULL,
    "CreatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "UserProfiles" (
    "ProfileID" SERIAL PRIMARY KEY,
    "UserID" INT NOT NULL UNIQUE,
    "Weight" DOUBLE PRECISION NULL,
    "Height" DOUBLE PRECISION NULL,
    "Age" INT NULL,
    "Gender" VARCHAR(20) NULL,
    "ActivityLevel" VARCHAR(50) NULL,
    "Goal" VARCHAR(50) NULL,
    "UpdatedAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT "FK_UserProfiles_UserID"
        FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "FoodItems" (
    "FoodID" SERIAL PRIMARY KEY,
    "FoodName" VARCHAR(100) NOT NULL,
    "Calories" DOUBLE PRECISION DEFAULT 0,
    "Protein" DOUBLE PRECISION DEFAULT 0,
    "Carbohydrates" DOUBLE PRECISION DEFAULT 0,
    "Fats" DOUBLE PRECISION DEFAULT 0,
    "ImagePath" TEXT NULL
);

CREATE TABLE IF NOT EXISTS "MealPlans" (
    "MealPlanID" SERIAL PRIMARY KEY,
    "UserID" INT NOT NULL,
    "Date" DATE NOT NULL,
    CONSTRAINT "FK_MealPlans_UserID"
        FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE CASCADE,
    CONSTRAINT "UQ_MealPlans_User_Date" UNIQUE ("UserID", "Date")
);

CREATE TABLE IF NOT EXISTS "MealPlanFoods" (
    "ID" SERIAL PRIMARY KEY,
    "MealPlanID" INT NOT NULL,
    "FoodID" INT NOT NULL,
    "Quantity" DOUBLE PRECISION DEFAULT 1,
    "MealType" VARCHAR(20) DEFAULT 'Lunch',
    CONSTRAINT "FK_MealPlanFoods_MealPlanID"
        FOREIGN KEY ("MealPlanID") REFERENCES "MealPlans"("MealPlanID") ON DELETE CASCADE,
    CONSTRAINT "FK_MealPlanFoods_FoodID"
        FOREIGN KEY ("FoodID") REFERENCES "FoodItems"("FoodID") ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "Saved_Meal_Plans" (
    "PlanID" SERIAL PRIMARY KEY,
    "UserID" INT NOT NULL,
    "PlanName" VARCHAR(100) NOT NULL,
    "CreatedAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT "FK_SavedMealPlans_UserID"
        FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Saved_Plan_Items" (
    "ID" SERIAL PRIMARY KEY,
    "PlanID" INT NOT NULL,
    "FoodID" INT NOT NULL,
    "Quantity" DOUBLE PRECISION DEFAULT 1,
    "MealType" VARCHAR(20) DEFAULT 'Lunch',
    CONSTRAINT "FK_SavedPlanItems_PlanID"
        FOREIGN KEY ("PlanID") REFERENCES "Saved_Meal_Plans"("PlanID") ON DELETE CASCADE,
    CONSTRAINT "FK_SavedPlanItems_FoodID"
        FOREIGN KEY ("FoodID") REFERENCES "FoodItems"("FoodID") ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "Articles" (
    "ArticleID" SERIAL PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "Content" TEXT NOT NULL,
    "Category" VARCHAR(50) NOT NULL,
    "CreatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Password_Resets" (
    "ID" SERIAL PRIMARY KEY,
    "UserID" INT NOT NULL,
    "Token" VARCHAR(255) NOT NULL,
    "ExpiresAt" TIMESTAMP NOT NULL,
    CONSTRAINT "FK_PasswordResets_UserID"
        FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "SystemSettings" (
    "SettingKey" VARCHAR(50) PRIMARY KEY,
    "SettingValue" TEXT NOT NULL
);

INSERT INTO "FoodItems" ("FoodName", "Calories", "Protein", "Carbohydrates", "Fats")
SELECT v."FoodName", v."Calories", v."Protein", v."Carbohydrates", v."Fats"
FROM (
    VALUES
        ('Chicken Breast (100g)', 165, 31, 0, 3.6),
        ('Brown Rice (100g)', 111, 2.6, 23, 0.9),
        ('Broccoli (100g)', 34, 2.8, 7, 0.4),
        ('Oatmeal (100g)', 389, 16.9, 66, 6.9),
        ('Egg (1 large)', 78, 6.3, 0.6, 5.3),
        ('Banana (1 medium)', 105, 1.3, 27, 0.4),
        ('Salmon (100g)', 208, 20, 0, 13),
        ('Sweet Potato (100g)', 86, 1.6, 20, 0.1)
) AS v("FoodName", "Calories", "Protein", "Carbohydrates", "Fats")
WHERE NOT EXISTS (SELECT 1 FROM "FoodItems");

INSERT INTO "SystemSettings" ("SettingKey", "SettingValue")
VALUES ('AdminRegistrationCode', 'ADMIN123')
ON CONFLICT ("SettingKey") DO NOTHING;

