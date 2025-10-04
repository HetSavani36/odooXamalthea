# Testing Manager-Employee Integration

## How to Test the Integration

### Step 1: Clear Previous Data (Optional)
Open browser console (F12) and run:
```javascript
localStorage.clear();
```
Then refresh the page.

### Step 2: Submit an Expense as Employee

1. Navigate to **Employee Dashboard** (`/employee/dashboard`)
2. Click **"New Expense"** button
3. Fill in the form:
   - Description: "Test Expense"
   - Category: "Meals"
   - Amount: "500"
   - Currency: "INR"
   - Date: Today's date
   - Paid By: Should auto-fill with "John Doe"
4. Click **"Submit"** button
5. You should see success message: "Expense submitted successfully! Now pending approval."
6. You'll be redirected to Employee Dashboard
7. The expense should appear with **Yellow "Pending Approval"** badge

### Step 3: Verify Data in LocalStorage

Open browser console (F12) and run:
```javascript
// Check employee's expenses
console.log('Employee Expenses:', JSON.parse(localStorage.getItem('expenses')));

// Check manager's waiting approval
console.log('Manager Waiting:', JSON.parse(localStorage.getItem('managerWaitingApproval')));
```

You should see the same expense in both arrays!

### Step 4: View in Manager Dashboard

1. Navigate to **Manager Dashboard** (`/manager/dashboard`)
2. Click the **🔄 Refresh** button if needed
3. Go to **"Waiting Approval"** tab
4. You should see your test expense with:
   - Employee: "John Doe"
   - Amount: "500"
   - Currency: "INR"
   - Category: "Meals"
   - Status: **Yellow "Waiting Approval"** badge

### Step 5: Manager Reviews the Expense

1. Click **"View Details"** on the expense
2. You'll see the expense details
3. Click **"Approve"** button on the expense item
4. Click **"Submit Review"** at the bottom
5. You should see: "Review submitted successfully!"
6. You'll be redirected back to Manager Dashboard

### Step 6: Verify Manager's Reviewed Tab

1. In Manager Dashboard, click **"Reviewed"** tab
2. You should see the expense with **Cyan "Reviewed"** badge

### Step 7: Verify Employee Sees the Update

1. Navigate back to **Employee Dashboard** (`/employee/dashboard`)
2. The expense should now show **Green "Approved"** badge
3. The **Summary Cards** at the top should update:
   - "Waiting approval" should decrease
   - "Approved" should increase

## Troubleshooting

### Issue: Expense not showing in Manager Dashboard

**Solution 1: Click Refresh Button**
- Click the 🔄 Refresh button in Manager Dashboard

**Solution 2: Check Console Logs**
```javascript
// Check if data was saved
console.log('Manager Waiting:', localStorage.getItem('managerWaitingApproval'));
```

**Solution 3: Hard Refresh**
- Press `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)

### Issue: Status not updating in Employee Dashboard

**Solution 1: Reload the Page**
- Click refresh or press `Cmd + R` / `Ctrl + R`

**Solution 2: Check Console Logs**
```javascript
// Check employee expenses
const expenses = JSON.parse(localStorage.getItem('expenses'));
console.log('Latest expense:', expenses[expenses.length - 1]);
```

### Issue: Getting "Not Found" or blank data

**Solution: Initialize Mock Data**
Run this in browser console:
```javascript
// Add initial manager data
localStorage.setItem('managerWaitingApproval', JSON.stringify([
    { id: 3, employee: 'Charlie D.', amount: '800.00', currency: 'EUR', category: 'Software', date: '2025-10-03', status: 'Waiting Approval' }
]));

// Refresh the page
location.reload();
```

## Verification Checklist

- ✅ Employee can submit expense
- ✅ Expense appears in Employee Dashboard with "Pending" status
- ✅ Expense appears in Manager Dashboard "Waiting Approval" tab
- ✅ Manager can view expense details
- ✅ Manager can approve/reject individual items
- ✅ After manager submits review, expense moves to "Reviewed" tab
- ✅ Employee sees updated status (Approved/Rejected)
- ✅ Summary cards update correctly on both dashboards
- ✅ Refresh button works
- ✅ Data persists after page reload

## Debug Commands

### View All LocalStorage Data
```javascript
console.log({
    expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),
    drafts: JSON.parse(localStorage.getItem('expenseDrafts') || '[]'),
    managerWaiting: JSON.parse(localStorage.getItem('managerWaitingApproval') || '[]'),
    managerReviewed: JSON.parse(localStorage.getItem('managerReviewed') || '[]'),
    managerApproved: JSON.parse(localStorage.getItem('managerApproved') || '[]')
});
```

### Count Expenses
```javascript
const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
const waiting = JSON.parse(localStorage.getItem('managerWaitingApproval') || '[]');
console.log(`Employee has ${expenses.length} expenses`);
console.log(`Manager has ${waiting.length} waiting approval`);
```

### Clear Specific Data
```javascript
// Clear only manager data
localStorage.removeItem('managerWaitingApproval');
localStorage.removeItem('managerReviewed');
localStorage.removeItem('managerApproved');

// Clear only employee data
localStorage.removeItem('expenses');
localStorage.removeItem('expenseDrafts');
```

## Expected Data Flow

```
1. Employee Submits
   └─> localStorage.expenses (status: 'pending')
   └─> localStorage.managerWaitingApproval (status: 'Waiting Approval')

2. Manager Reviews
   └─> Remove from localStorage.managerWaitingApproval
   └─> Add to localStorage.managerReviewed (status: 'Reviewed')
   └─> Update localStorage.expenses (status: 'approved' or 'rejected')

3. Employee Views
   └─> Load from localStorage.expenses
   └─> Display updated status
```

## Success Indicators

When everything is working correctly, you should see:

1. **Console logs** when submitting:
   ```
   Submitting expense: {id: 1234567890, status: 'pending', ...}
   ```

2. **Console logs** in Manager Dashboard:
   ```
   Manager Dashboard - Loaded expenses: {waiting: 1, approved: 0, reviewed: 0}
   ```

3. **Console logs** in Employee Dashboard:
   ```
   Employee Dashboard - Loaded expenses: {drafts: 0, submitted: 1, total: 1}
   ```

4. **Alert messages**:
   - "Expense submitted successfully! Now pending approval."
   - "Review submitted successfully!"

If you see all these, the integration is working correctly! ✅
