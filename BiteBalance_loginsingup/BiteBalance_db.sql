/*
    Bite Balance - Database Submission
    Deliverable 3 & 4: Login/Signup with Advanced DB Concepts
    Includes: Tables, Constraints, Stored Procedures, Views, Triggers, and Transactions.
*/

-- =============================================
-- 1. TABLES & CONSTRAINTS
-- =============================================

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

-- =============================================
-- 2. VIEWS
-- =============================================

-- View to get complete user details for the profile/dashboard
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

-- =============================================
-- 3. STORED PROCEDURES (with Transactions & Logic)
-- =============================================

-- Procedure for User Registration
-- Implements back-end checks and uses Transactions
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

    -- Start Transaction Logic (PL/pgSQL blocks are atomic by default in some contexts, 
    -- but we can use nested blocks or explicit status handling)
    
    -- Check for existing email
    IF EXISTS (SELECT 1 FROM "Users" WHERE "Email" = p_email) THEN
        p_message := 'Error: Email already registered.';
        RETURN;
    END IF;

    -- Insert User
    INSERT INTO "Users" ("Username", "Email", "PasswordHash", "Role")
    VALUES (p_username, p_email, p_password_hash, p_role)
    RETURNING "UserID" INTO p_user_id;

    -- Create empty profile automatically (Transaction Part 2)
    INSERT INTO "UserProfiles" ("UserID")
    VALUES (p_user_id);

    p_message := 'Success: User registered.';

EXCEPTION WHEN OTHERS THEN
    -- Implicit Rollback on error
    p_message := 'Error: Transaction failed. ' || SQLERRM;
    p_user_id := NULL;
END;
$$;

-- Procedure for User Login (Backend check)
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

-- =============================================
-- 4. TRIGGERS
-- =============================================

-- Function for Trigger
CREATE OR REPLACE FUNCTION "fn_LogNewUser"()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO "UserActivity" ("UserID", "Type", "Detail")
    VALUES (NEW."UserID", 'USER_REGISTERED', 'A new user account was created via signup.');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: After User Insert
DROP TRIGGER IF EXISTS "tr_AfterUserInsert" ON "Users";
CREATE TRIGGER "tr_AfterUserInsert"
AFTER INSERT ON "Users"
FOR EACH ROW
EXECUTE FUNCTION "fn_LogNewUser"();

-- =============================================
-- 5. SEED DATA
-- =============================================
INSERT INTO "Users" ("Username", "Email", "PasswordHash", "Role")
VALUES ('admin', 'admin@bitebalance.com', '$2a$10$YourHashedPasswordHere', 'ADMIN')
ON CONFLICT DO NOTHING;
