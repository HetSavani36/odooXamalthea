# Dashboard Migration Plan

This document outlines the step-by-step plan to migrate all dashboard pages from localStorage to real backend API.

## 🎯 Migration Priority

### Phase 1: Core User Dashboards (HIGH)
1. ✅ Login.jsx - COMPLETED
2. ✅ AdminRegister.jsx - COMPLETED
3. ⏳ EmployeeDashboard.jsx
4. ⏳ ManagerDashboard.jsx

### Phase 2: Admin Pages (MEDIUM)
5. ⏳ AdminUserManagement.jsx
6. ⏳ AdminMainDashboard.jsx
7. ⏳ AdminApprovalConfig.jsx

### Phase 3: Expense Pages (MEDIUM)
8. ⏳ ExpenseSubmissionPage.jsx
9. ⏳ DraftExpensesPage.jsx
10. ⏳ NewExpenseSubmission.jsx

### Phase 4: Approval Workflow (LOW)
11. ⏳ ManagerApprovalDetail.jsx

---

## 📋 Detailed Migration Plans

### 3. EmployeeDashboard.jsx

**Current State:** Uses localStorage to store and retrieve expenses

**Changes Needed:**
1. Add imports:
   ```javascript
   import { expenseAPI, dashboardAPI, handleAPIError } from '../services/api';
   ```

2. Add state:
   ```javascript
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   ```

3. Replace `loadExpenses()` function:
   ```javascript
   const loadExpenses = async () => {
     setLoading(true);
     setError('');
     try {
       const response = await expenseAPI.getMyExpenses();
       if (response.success) {
         setExpenses(response.data);
       }
     } catch (err) {
       const errorInfo = handleAPIError(err);
       setError(errorInfo.message);
     } finally {
       setLoading(false);
     }
   };
   ```

4. Replace `handleCreateExpense()`:
   ```javascript
   const handleCreateExpense = async (newExpense) => {
     try {
       const response = await expenseAPI.create(newExpense);
       if (response.success) {
         setExpenses([...expenses, response.data]);
       }
     } catch (err) {
       const errorInfo = handleAPIError(err);
       alert(errorInfo.message);
     }
   };
   ```

5. Replace `handleDeleteExpense()`:
   ```javascript
   const handleDeleteExpense = async (id) => {
     try {
       await expenseAPI.delete(id);
       setExpenses(expenses.filter(exp => exp._id !== id));
     } catch (err) {
       const errorInfo = handleAPIError(err);
       alert(errorInfo.message);
     }
   };
   ```

6. Replace `handleSubmitExpense()`:
   ```javascript
   const handleSubmitExpense = async (id) => {
     try {
       const response = await expenseAPI.submit(id);
       if (response.success) {
         setExpenses(expenses.map(exp => 
           exp._id === id ? response.data : exp
         ));
       }
     } catch (err) {
       const errorInfo = handleAPIError(err);
       alert(errorInfo.message);
     }
   };
   ```

7. Add loading spinner in JSX
8. Add error message display

**API Endpoints Used:**
- `GET /api/expense/my-expenses` - Get user's expenses
- `POST /api/expense` - Create new expense
- `PUT /api/expense/:id` - Update expense
- `DELETE /api/expense/:id` - Delete expense
- `POST /api/expense/:id/submit` - Submit for approval

---

### 4. ManagerDashboard.jsx

**Current State:** Uses localStorage for pending approvals

**Changes Needed:**
1. Add imports:
   ```javascript
   import { expenseAPI, handleAPIError } from '../services/api';
   ```

2. Add state:
   ```javascript
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   ```

3. Replace data loading per tab:
   ```javascript
   // Waiting Approval Tab
   const loadPendingExpenses = async () => {
     setLoading(true);
     try {
       const response = await expenseAPI.getPendingExpenses();
       if (response.success) {
         setWaitingExpenses(response.data);
       }
     } catch (err) {
       setError(handleAPIError(err).message);
     } finally {
       setLoading(false);
     }
   };

   // Approved Tab
   const loadApprovedExpenses = async () => {
     const response = await expenseAPI.getAll();
     const approved = response.data.filter(exp => exp.status === 'approved');
     setApprovedExpenses(approved);
   };

   // Rejected Tab
   const loadRejectedExpenses = async () => {
     const response = await expenseAPI.getAll();
     const rejected = response.data.filter(exp => exp.status === 'rejected');
     setRejectedExpenses(rejected);
   };
   ```

4. Replace `handleApprove()`:
   ```javascript
   const handleApprove = async (id) => {
     try {
       const response = await expenseAPI.approve(id, {
         approverComments: 'Approved by manager'
       });
       if (response.success) {
         // Refresh data
         loadPendingExpenses();
         loadApprovedExpenses();
       }
     } catch (err) {
       alert(handleAPIError(err).message);
     }
   };
   ```

5. Replace `handleReject()`:
   ```javascript
   const handleReject = async (id, reason) => {
     try {
       const response = await expenseAPI.reject(id, {
         approverComments: reason || 'Rejected by manager'
       });
       if (response.success) {
         // Refresh data
         loadPendingExpenses();
         loadRejectedExpenses();
       }
     } catch (err) {
       alert(handleAPIError(err).message);
     }
   };
   ```

6. Add useEffect to load data on tab change
7. Add loading states and error handling

**API Endpoints Used:**
- `GET /api/expense/pending` - Get pending expenses (manager only)
- `GET /api/expense` - Get all expenses with filters
- `POST /api/expense/:id/approve` - Approve expense
- `POST /api/expense/:id/reject` - Reject expense

---

### 5. AdminUserManagement.jsx

**Current State:** Uses hardcoded mock users

**Changes Needed:**
1. Add imports:
   ```javascript
   import { userAPI, handleAPIError } from '../services/api';
   ```

2. Add state:
   ```javascript
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   ```

3. Add `loadUsers()`:
   ```javascript
   const loadUsers = async () => {
     setLoading(true);
     try {
       const response = await userAPI.getAllUsers();
       if (response.success) {
         setUsers(response.data);
       }
     } catch (err) {
       setError(handleAPIError(err).message);
     } finally {
       setLoading(false);
     }
   };

   useEffect(() => {
     loadUsers();
   }, []);
   ```

4. Replace `handleAddUser()`:
   ```javascript
   const handleAddUser = async (userData) => {
     try {
       const response = await userAPI.createUser(userData);
       if (response.success) {
         setUsers([...users, response.data]);
       }
     } catch (err) {
       alert(handleAPIError(err).message);
     }
   };
   ```

5. Replace `handleDeleteUser()`:
   ```javascript
   const handleDeleteUser = async (id) => {
     if (window.confirm('Are you sure?')) {
       try {
         await userAPI.deleteUser(id);
         setUsers(users.filter(u => u._id !== id));
       } catch (err) {
         alert(handleAPIError(err).message);
       }
     }
   };
   ```

6. Replace `handleUpdateUser()`:
   ```javascript
   const handleUpdateUser = async (id, updatedData) => {
     try {
       const response = await userAPI.updateUser(id, updatedData);
       if (response.success) {
         setUsers(users.map(u => u._id === id ? response.data : u));
       }
     } catch (err) {
       alert(handleAPIError(err).message);
     }
   };
   ```

**API Endpoints Used:**
- `GET /api/user` - Get all users (admin only)
- `POST /api/user` - Create user (admin only)
- `PUT /api/user/:id` - Update user
- `DELETE /api/user/:id` - Delete user (admin only)

---

### 6. AdminMainDashboard.jsx

**Current State:** May use hardcoded stats

**Changes Needed:**
1. Add imports:
   ```javascript
   import { dashboardAPI, adminAPI, handleAPIError } from '../services/api';
   ```

2. Load dashboard data:
   ```javascript
   const loadDashboardData = async () => {
     try {
       const [dashboardRes, statsRes] = await Promise.all([
         dashboardAPI.getAdminDashboard(),
         adminAPI.getStats()
       ]);
       
       if (dashboardRes.success) {
         setDashboardData(dashboardRes.data);
       }
       if (statsRes.success) {
         setStats(statsRes.data);
       }
     } catch (err) {
       setError(handleAPIError(err).message);
     }
   };
   ```

**API Endpoints Used:**
- `GET /api/dashboard/admin` - Get admin dashboard data
- `GET /api/admin/stats` - Get admin statistics

---

### 7. ExpenseSubmissionPage.jsx

**Current State:** Uses localStorage to store expenses

**Changes Needed:**
1. Replace form submission with `expenseAPI.create()`
2. Add file upload handling with FormData
3. Use `expenseAPI.getMyExpenses()` to list expenses

**API Endpoints Used:**
- `POST /api/expense` - Create expense with file upload
- `GET /api/expense/my-expenses` - Get user's expenses

---

### 8. DraftExpensesPage.jsx

**Current State:** Filters localStorage for draft expenses

**Changes Needed:**
1. Load from API and filter on frontend:
   ```javascript
   const response = await expenseAPI.getMyExpenses();
   const drafts = response.data.filter(exp => exp.status === 'draft');
   ```

---

### 9. NewExpenseSubmission.jsx

**Current State:** Adds to localStorage

**Changes Needed:**
1. Use `expenseAPI.create()` with status 'draft'

---

### 10. AdminApprovalConfig.jsx

**Current State:** May use localStorage for rules

**Changes Needed:**
1. Use `adminAPI.getApprovalRules()`
2. Use `adminAPI.createApprovalRule()`
3. Use `adminAPI.updateApprovalRule()`
4. Use `adminAPI.deleteApprovalRule()`

---

## 🔧 Common Patterns

### Loading State Template
```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const loadData = async () => {
  setLoading(true);
  setError('');
  try {
    const response = await apiMethod();
    if (response.success) {
      setData(response.data);
    }
  } catch (err) {
    const errorInfo = handleAPIError(err);
    setError(errorInfo.message);
  } finally {
    setLoading(false);
  }
};
```

### Error Display Template
```javascript
{error && (
  <div style={styles.errorBox}>
    {error}
  </div>
)}
```

### Loading Spinner Template
```javascript
{loading ? (
  <div style={styles.spinner}>Loading...</div>
) : (
  // Your content here
)}
```

---

## ✅ Testing Checklist Per Page

For each migrated page, test:
- [ ] Data loads from API successfully
- [ ] Loading state shows during API calls
- [ ] Errors display properly
- [ ] Create operations work
- [ ] Update operations work
- [ ] Delete operations work
- [ ] Token refresh works on 401
- [ ] No console errors
- [ ] Network tab shows correct API calls
- [ ] Data persists in MongoDB

---

## 🎯 Success Criteria

All pages should:
1. ✅ Use API service instead of localStorage
2. ✅ Show loading states
3. ✅ Display error messages
4. ✅ Clear errors on user interaction
5. ✅ Disable buttons during loading
6. ✅ Refresh data after mutations
7. ✅ Handle 401 with token refresh
8. ✅ Persist data to MongoDB

---

**Start with EmployeeDashboard.jsx first - it's the most commonly used page!**
