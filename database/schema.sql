/*
  Smart Meal Planner System - Database Schema (MS SQL Server)
*/

DROP TABLE IF EXISTS Password_Resets;
DROP TABLE IF EXISTS MealPlanFoods;
DROP TABLE IF EXISTS MealPlans;
DROP TABLE IF EXISTS Saved_Plan_Items;
DROP TABLE IF EXISTS Saved_Meal_Plans;
DROP TABLE IF EXISTS UserProfiles;
DROP TABLE IF EXISTS FoodItems;
DROP TABLE IF EXISTS Articles;
DROP TABLE IF EXISTS SystemSettings;
DROP TABLE IF EXISTS Users;


-- Create Users table
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    Role NVARCHAR(20) DEFAULT 'USER', -- USER, ADMIN
    VerificationCode NVARCHAR(10) NULL,
    CodeExpires DATETIME NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Create UserProfiles table
CREATE TABLE UserProfiles (
    ProfileID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL UNIQUE,
    Weight FLOAT NULL,
    Height FLOAT NULL,
    Age INT NULL,
    Gender NVARCHAR(20) NULL,
    ActivityLevel NVARCHAR(50) NULL,
    Goal NVARCHAR(50) NULL,
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Create FoodItems table
CREATE TABLE FoodItems (
    FoodID INT PRIMARY KEY IDENTITY(1,1),
    FoodName NVARCHAR(100) NOT NULL,
    Calories FLOAT DEFAULT 0,
    Protein FLOAT DEFAULT 0,
    Carbohydrates FLOAT DEFAULT 0,
    Fats FLOAT DEFAULT 0,
    ImagePath NVARCHAR(MAX) NULL
);

-- Create MealPlans table
CREATE TABLE MealPlans (
    MealPlanID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    Date DATE NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Create MealPlanFoods table (Junction table)
CREATE TABLE MealPlanFoods (
    ID INT PRIMARY KEY IDENTITY(1,1),
    MealPlanID INT NOT NULL,
    FoodID INT NOT NULL,
    Quantity FLOAT DEFAULT 1,
    MealType NVARCHAR(20) DEFAULT 'Lunch', -- Breakfast, Lunch, Dinner, Snacks
    FOREIGN KEY (MealPlanID) REFERENCES MealPlans(MealPlanID) ON DELETE CASCADE,
    FOREIGN KEY (FoodID) REFERENCES FoodItems(FoodID)
);

-- Create Saved_Meal_Plans table
CREATE TABLE Saved_Meal_Plans (
    PlanID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    PlanName NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Create Saved_Plan_Items table
CREATE TABLE Saved_Plan_Items (
    ID INT PRIMARY KEY IDENTITY(1,1),
    PlanID INT NOT NULL,
    FoodID INT NOT NULL,
    Quantity FLOAT DEFAULT 1,
    MealType NVARCHAR(20) DEFAULT 'Lunch',
    FOREIGN KEY (PlanID) REFERENCES Saved_Meal_Plans(PlanID) ON DELETE CASCADE,
    FOREIGN KEY (FoodID) REFERENCES FoodItems(FoodID)
);

-- Create Articles table
CREATE TABLE Articles (
    ArticleID INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(200) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Category NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Create Password_Resets table
CREATE TABLE Password_Resets (
    ID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    Token NVARCHAR(255) NOT NULL,
    ExpiresAt DATETIME NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Seed some initial food data
INSERT INTO FoodItems (FoodName, Calories, Protein, Carbohydrates, Fats) VALUES
('Chicken Breast (100g)', 165, 31, 0, 3.6),
('Brown Rice (100g)', 111, 2.6, 23, 0.9),
('Broccoli (100g)', 34, 2.8, 7, 0.4),
('Oatmeal (100g)', 389, 16.9, 66, 6.9),
('Egg (1 large)', 78, 6.3, 0.6, 5.3),
('Banana (1 medium)', 105, 1.3, 27, 0.4),
('Salmon (100g)', 208, 20, 0, 13),
('Sweet Potato (100g)', 86, 1.6, 20, 0.1);

-- Create SystemSettings table
CREATE TABLE SystemSettings (
    SettingKey NVARCHAR(50) PRIMARY KEY,
    SettingValue NVARCHAR(MAX) NOT NULL
);

-- Seed initial admin registration code
INSERT INTO SystemSettings (SettingKey, SettingValue) VALUES ('AdminRegistrationCode', 'ADMIN123');


