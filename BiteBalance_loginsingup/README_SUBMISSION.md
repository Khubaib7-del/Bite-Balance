# Bite Balance - Project Submission (DB Lab)

## Project Overview
**Bite Balance** is a smart meal planning system. This submission contains the Login and Signup functionality requested for Deliverable 3 & 4, implemented with advanced database concepts.

## Technology Stack Mapping
Since our class is using modern web technologies instead of traditional ASP.NET, we have mapped the requirements as follows:

| ASP.NET Requirement | Our Implementation | Description |
|--------------------|--------------------|-------------|
| **.aspx Webforms** | `AuthPage.jsx` | React-based GUI for Login & Signup with front-end validation. |
| **.css & .js files** | `AuthStyles.css` | Styling for the authentication interface. |
| **.aspx.cs files** | `AuthController.js` | 2nd Tier Business Logic (validation, hashing, and response logic). |
| **DAL.cs** | `DAL.js` | 3rd Tier Data Access Layer (DB connectivity and procedure calls). |
| **.sql File** | `BiteBalance_db.sql` | Database schema including advanced features (SP, Views, Triggers). |

## Advanced Database Concepts Implemented
As per the evaluation criteria, we have incorporated the following fundamental database ideas:

1. **Stored Procedures**:
   - `sp_RegisterUser`: Handles multi-table inserts with input validation.
   - `fn_ValidateLogin`: Securely retrieves user records for authentication.
2. **Views**:
   - `vw_UserProfileDetails`: A complex view joining `Users` and `UserProfiles` to simplify frontend data retrieval.
3. **Triggers**:
   - `tr_AfterUserInsert`: Automatically logs a "USER_REGISTERED" entry into the `UserActivity` table whenever a new user joins.
4. **Transactions**:
   - Implemented within `sp_RegisterUser` to ensure atomicity when creating a User and their Profile simultaneously.
5. **Back-end Checks**:
   - Validations for email format, username presence, and duplicate records are handled directly within the Stored Procedures.

## How to Evaluate
1. Open `BiteBalance_db.sql` to review the Stored Procedures, Triggers, and Views.
2. Review `AuthController.js` to see the Business Logic layer.
3. Review `DAL.js` to see how the application communicates with the database using the stored procedures.
4. The GUI (`AuthPage.jsx`) demonstrates complete front-end validation and redirect logic.

---
**Submitted by:** [Your Names / Roll Numbers]
