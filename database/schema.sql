/*
    Smart Meal Planner System - Database Schema (PostgreSQL)
    Run this in pgAdmin after selecting the SmartMealPlanner database.
*/

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

CREATE TABLE IF NOT EXISTS "UserActivity" (
    "ActivityID" SERIAL PRIMARY KEY,
    "UserID" INT NULL,
    "Type" VARCHAR(50) NOT NULL,
    "Detail" TEXT NULL,
    "Meta" JSONB NULL,
    "CreatedAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT "FK_UserActivity_UserID"
        FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "IX_UserActivity_CreatedAt" ON "UserActivity" ("CreatedAt" DESC);

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

-- =============================================
-- =============================================

-- 1. VIEWS
-- View to get complete user details
CREATE OR REPLACE VIEW "vw_UserProfileDetails" AS
SELECT 
    u."UserID",
    u."Username",
    u."Email",
    u."Role",
    u."CreatedAt" as "AccountCreated",
    p."Weight",
    p."Height",
    p."Age",
    p."Gender",
    p."Goal",
    p."ActivityLevel"
FROM "Users" u
LEFT JOIN "UserProfiles" p ON u."UserID" = p."UserID";

-- 2. STORED PROCEDURES (with Transactions & Logic)
-- Procedure for User Registration
CREATE OR REPLACE PROCEDURE "sp_RegisterUser"(
    p_username VARCHAR(50),
    p_email VARCHAR(100),
    p_password_hash TEXT,
    p_role VARCHAR(20),
    OUT p_user_id INT,
    OUT p_message TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Back-end Validation Checks
    IF p_username IS NULL OR p_username = '' THEN
        p_message := 'Error: Username is required.';
        RETURN;
    END IF;

    IF p_email NOT LIKE '%_@__%.__%' THEN
        p_message := 'Error: Invalid email format.';
        RETURN;
    END IF;

    -- Check for existing email
    IF EXISTS (SELECT 1 FROM "Users" WHERE "Email" = p_email) THEN
        p_message := 'Error: Email already registered.';
        RETURN;
    END IF;

    -- Transactional Insert
    INSERT INTO "Users" ("Username", "Email", "PasswordHash", "Role")
    VALUES (p_username, p_email, p_password_hash, p_role)
    RETURNING "UserID" INTO p_user_id;

    -- Create empty profile automatically (Transactional Part 2)
    INSERT INTO "UserProfiles" ("UserID")
    VALUES (p_user_id);

    p_message := 'Success: User registered.';

EXCEPTION WHEN OTHERS THEN
    p_message := 'Error: Transaction failed. ' || SQLERRM;
    p_user_id := NULL;
END;
$$;

-- Function for Login Validation
CREATE OR REPLACE FUNCTION "fn_ValidateLogin"(
    p_email VARCHAR(100)
)
RETURNS TABLE (
    "UserID" INT,
    "Username" VARCHAR(50),
    "PasswordHash" TEXT,
    "Role" VARCHAR(20)
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT u."UserID", u."Username", u."PasswordHash", u."Role"
    FROM "Users" u
    WHERE u."Email" = p_email;
END;
$$;

-- 3. TRIGGERS
-- Function for Trigger
CREATE OR REPLACE FUNCTION "fn_LogNewUser"()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO "UserActivity" ("UserID", "Type", "Detail")
    VALUES (NEW."UserID", 'USER_REGISTERED', 'A new user account was created.');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: After User Insert
DROP TRIGGER IF EXISTS "tr_AfterUserInsert" ON "Users";
CREATE TRIGGER "tr_AfterUserInsert"
AFTER INSERT ON "Users"
FOR EACH ROW
EXECUTE FUNCTION "fn_LogNewUser"();



