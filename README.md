💰 Expense Workflow Management System
This is a robust backend solution for a corporate expense reporting system, built to replace manual, error-prone approval processes. The core feature is a dynamic, multi-level approval workflow engine capable of handling complex sequential routing combined with configurable conditional approval rules (e.g., "60% approval" or "CFO sign-off").

The system adheres to modern backend best practices, utilizing dedicated controllers and clear data separation based on user roles (Employee, Manager, Admin).

✨ Core Features & Business Logic
Feature

Description

Technical Implementation

Dynamic Workflow Engine

Admin defines a custom sequence of approvers for any submitted expense. Includes automatic manager pre-approval if configured.

assignWorkflow controller

Immediate Conditional Approval

Approvals are finalized immediately when a percentage or specific approver threshold is met, skipping remaining sequential steps.

approveExpense (via checkFinalApprovalRule logic)

Dynamic Currency Conversion

Expense amounts are converted from the submission currency (e.g., INR) to the Company's native reporting currency (fetched from Company.currency.code) for all management views.

getCompanyCurrencyCode, attachConvertedAmount

Role-Based Views

Managers view expenses pending their approval (/pending) and all expenses submitted by their direct reports (/team).

getPendingApprovals, getTeamExpenses

Strict State Control

Ensures expenses can only be updated/deleted while in the Draft status and enforces sequential approval flow.

Logic in updateExpense, deleteExpense

🛠️ Project Structure (Backend)
The codebase follows a modular structure focused on the separation of concerns and role-based logic.

.
├── controllers/
│   └── expense.controller.js  # Unified controller logic for all roles (Employee, Manager, Admin)
├── models/
│   ├── expense.model.js       # Expense schema with nested ApprovalSteps and Rules (Crucial!)
│   ├── user.model.js          # User schema with role and managerId
│   └── company.model.js       # Company schema with dynamic currency setting
├── routes/
│   └── expense.routes.js      # Unified router mapping all role actions to endpoints
└── utils/
    ├── ApiError.js            # Custom error class for clean error handling
    └── asyncHandler.js        # Wrapper for try/catch elimination

🔌 API Endpoints
All endpoints are prefixed with /api/v1. Authentication middleware (authMiddleware) is assumed to be required for all routes.

Role

Method

Path

Controller

Description

Employee

POST

/expenses

createExpense

Creates a new expense (as Draft or Submitted).

Employee

PUT

/expenses/:id

updateExpense

Edits a claim (only permitted if status is Draft).

Employee

PUT

/expenses/:id/submit

submitExpense

Moves claim from Draft to Awaiting Admin Review.

Manager

GET

/approvals/pending

getPendingApprovals

Lists expenses requiring the current manager's action (it's their turn).

Manager

PUT

/approvals/:id/approve

approveExpense

Approves current step. Triggers escalation or immediate final approval.

Manager

PUT

/approvals/:id/reject

rejectExpense

Rejects claim, terminating the entire workflow.

Manager

GET

/approvals/team

getTeamExpenses

View all expenses submitted by direct reports.

Admin

POST

/admin/expenses/:id/assign-workflow

assignWorkflow

Sets up the custom approver sequence and rules for a submitted expense.

Admin

GET

/admin/analytics

getAdminAnalytics

Provides user counts, monthly totals, and active rule types.

⚙️ Getting Started
Prerequisites
Node.js (v18+)

MongoDB Instance (Local or Atlas)

Installation
Clone the repository:

git clone [YOUR-REPO-URL]
cd expense-workflow-system

Install dependencies:

npm install express mongoose dotenv bcrypt jsonwebtoken

Set up Environment Variables (.env file):

# Database
MONGO_URI=mongodb://127.0.0.1:27017/expenseDB

# Server
PORT=5000
HASH_SALT_ROUNDS=10

# JWT Secrets (Replace with long, complex strings)
ACCESS_TOKEN_SECRET_KEY=your_access_secret
REFRESH_TOKEN_SECRET_KEY=your_refresh_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=30d

Database Seeding (Essential for Testing)
You must run the seed.js script to populate the database with test users (Admin, Managers, Employees) and sample expenses required to validate the complex approval flows.

# Add a seed script to your package.json:
# "scripts": { "start": "node server.js", "seed": "node seed.js" }

npm run seed

Running the Server
npm start

The API server will run on http://localhost:5000. Use Postman to begin testing the endpoints, starting with the Login route to obtain a valid AUTH_TOKEN.
