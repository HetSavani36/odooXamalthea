# Manager-Employee Integration with LocalStorage

## Overview
This document explains how the expense management system integrates between employee and manager dashboards using localStorage (without backend).

## Data Flow

### 1. Employee Submits Expense
**File:** `NewExpenseSubmission.jsx`

When an employee submits an expense:
1. Expense is saved to **`localStorage.expenses`** (employee's expenses)
2. Expense is also saved to **`localStorage.managerWaitingApproval`** (manager's waiting list)
3. Status is set to `'pending'` for employee and `'Waiting Approval'` for manager
4. Employee is redirected to their dashboard

**Key Code:**
```javascript
// Save to employee's expenses
localStorage.setItem('expenses', JSON.stringify(expenses));

// Save to manager's waiting approval
localStorage.setItem('managerWaitingApproval', JSON.stringify(managerWaitingApproval));
```

### 2. Manager Reviews Expense
**File:** `ManagerDashboard.jsx`

Manager sees expenses in three tabs:
- **Waiting Approval** (Yellow badge) - Expenses pending review
- **Reviewed** (Cyan badge) - Expenses that have been reviewed
- **Approved** (Green badge) - Fully approved expenses

**localStorage Keys:**
- `managerWaitingApproval` - Pending expenses
- `managerReviewed` - Reviewed expenses
- `managerApproved` - Approved expenses

### 3. Manager Approves/Rejects Individual Items
**File:** `ManagerApprovalDetail.jsx`

Manager can approve or reject each expense item individually:
- Click **"Approve"** → Item is immediately approved
- Click **"Reject"** → Reason field appears, manager must provide reason

When manager clicks **"Submit Review"**:
1. Validates all items have been reviewed
2. Validates rejected items have reasons
3. Determines overall status:
   - If any item rejected → `'rejected'`
   - If all items approved → `'approved'`
   - Mixed → `'reviewed'`
4. Updates **manager's** localStorage:
   - Removes from `managerWaitingApproval`
   - Adds to `managerReviewed`
5. Updates **employee's** localStorage:
   - Updates status in `expenses` array
   - Adds history entry with manager's decision

**Key Code:**
```javascript
// Update employee's expense
employeeExpenses[index].status = overallStatus; // 'approved', 'rejected', or 'reviewed'
employeeExpenses[index].itemStatuses = itemStatuses;
localStorage.setItem('expenses', JSON.stringify(employeeExpenses));

// Update manager's lists
localStorage.setItem('managerWaitingApproval', JSON.stringify(waitingApproval));
localStorage.setItem('managerReviewed', JSON.stringify(reviewed));
```

### 4. Employee Sees Updated Status
**File:** `EmployeeDashboard.jsx`

Employee dashboard automatically shows updated status:
- Loads from `localStorage.expenses`
- Displays color-coded badges:
  - 🔵 **Gray** - Draft
  - 🟡 **Yellow** - Pending Approval
  - 🟢 **Green** - Approved
  - 🔴 **Red** - Rejected

Summary cards show totals for each status category.

## LocalStorage Schema

### Employee's Expenses (`expenses`)
```json
[
  {
    "id": 1234567890,
    "description": "Team lunch",
    "expenseDate": "2025-10-01",
    "category": "Meals",
    "paidBy": "John Doe",
    "totalAmount": "500",
    "currency": "INR",
    "remarks": "Client meeting",
    "status": "pending", // or 'approved', 'rejected', 'draft'
    "submittedAt": "2025-10-01T10:30:00Z",
    "reviewedDate": "2025-10-02",
    "itemStatuses": {
      "1": { "status": "approved", "reason": "" }
    },
    "history": [
      {
        "id": 1234567891,
        "approver": "Manager",
        "status": "Approved",
        "time": "10:30, 2 Oct 2025"
      }
    ]
  }
]
```

### Manager's Waiting Approval (`managerWaitingApproval`)
```json
[
  {
    "id": 1234567890,
    "employee": "John Doe",
    "amount": "500",
    "currency": "INR",
    "category": "Meals",
    "date": "2025-10-01",
    "status": "Waiting Approval",
    "description": "Team lunch",
    "remarks": "Client meeting"
  }
]
```

### Manager's Reviewed (`managerReviewed`)
```json
[
  {
    "id": 1234567890,
    "employee": "John Doe",
    "amount": "500",
    "currency": "INR",
    "category": "Meals",
    "date": "2025-10-01",
    "status": "Reviewed",
    "reviewedDate": "2025-10-02",
    "overallStatus": "approved", // or 'rejected', 'reviewed'
    "itemStatuses": {
      "1": { "status": "approved", "reason": "" }
    }
  }
]
```

## Status Flow

```
Employee Side:
draft → pending → (approved/rejected)

Manager Side:
Waiting Approval → Reviewed

Combined:
1. Employee creates expense → status: 'draft'
2. Employee submits → status: 'pending' + appears in manager's 'Waiting Approval'
3. Manager reviews → moves to manager's 'Reviewed' + employee status becomes 'approved' or 'rejected'
```

## Key Features

### ✅ Real-time Sync
Both dashboards update immediately when localStorage changes (on page refresh or navigation)

### ✅ Individual Item Approval
Manager can approve/reject each expense item separately with reasons

### ✅ Status Tracking
Complete history of who approved/rejected and when

### ✅ Data Persistence
All data persists across browser sessions using localStorage

### ✅ Validation
- Employee can't edit submitted expenses
- Manager must review all items before submitting
- Manager must provide reasons for rejections

## Testing the Integration

1. **Submit Expense as Employee:**
   - Go to `/employee/new-expense`
   - Fill in expense details
   - Click "Submit"
   - Verify it appears in employee dashboard with "Pending" status

2. **Review as Manager:**
   - Go to `/manager/dashboard`
   - See expense in "Waiting Approval" tab
   - Click "View Details"
   - Approve or reject items
   - Click "Submit Review"

3. **Verify Employee Side:**
   - Go to `/employee/dashboard`
   - Verify expense status updated to "Approved" or "Rejected"
   - Check summary cards reflect the change

## Future Backend Integration

When backend is implemented, replace localStorage calls with API calls:
- `POST /api/expenses` - Submit expense
- `GET /api/manager/pending` - Get waiting approval list
- `POST /api/manager/review/:id` - Submit review decision
- `GET /api/employee/expenses` - Get employee's expenses
