# Quick Start Guide - Backend Integration

## 🚀 Servers Are Running!

Both servers are currently running and ready to test:
- **Backend:** http://localhost:5000 ✅
- **Frontend:** http://localhost:5173 ✅
- **Database:** MongoDB Atlas Connected ✅

## 🧪 Test the Integration NOW

### Step 1: Create an Admin Account
1. Open your browser: http://localhost:5173
2. Click "Create New Account"
3. Fill in the registration form:
   - **Company Name:** Your company name
   - **Country:** Select any country (determines currency)
   - **Email:** admin@test.com
   - **Password:** password123
   - **Confirm Password:** password123
4. Click "Register Company"
5. You should see: "Registration successful! Redirecting..."
6. You'll be redirected to Admin Dashboard

### Step 2: Test Login
1. Go back to: http://localhost:5173
2. Enter credentials:
   - **Email:** admin@test.com
   - **Password:** password123
3. Click "Sign In"
4. You should be redirected to Admin Dashboard based on your role

### Step 3: Check Backend Response
Open browser DevTools (F12) → Network tab and watch:
- `POST /api/auth/register` - Should return 201 with user data
- `POST /api/auth/login` - Should return 200 with user + tokens
- Check localStorage - Should have `accessToken` and `refreshToken`

## 🎯 What's Working

### ✅ Fully Integrated
- Login page with real authentication
- Admin registration with company setup
- JWT token storage and auto-refresh
- Error handling and display
- Loading states
- Role-based navigation

### 🔄 Still Using Mock Data
- Employee Dashboard
- Manager Dashboard
- Admin User Management
- Expense Submission Pages
- Approval Workflows

## 🛠️ Backend API Endpoints You Can Test

### Authentication
```bash
# Register (POST)
http://localhost:5000/api/auth/register
Body: {
  "email": "admin@test.com",
  "password": "password123",
  "companyName": "Test Company",
  "country": "United States",
  "currency": "USD",
  "role": "admin"
}

# Login (POST)
http://localhost:5000/api/auth/login
Body: {
  "email": "admin@test.com",
  "password": "password123"
}

# Get Current User (GET)
http://localhost:5000/api/auth/me
Headers: { "Authorization": "Bearer <your_token>" }
```

### Using Postman or Thunder Client
1. Install Thunder Client VS Code extension
2. Test endpoints directly
3. Copy token from login response
4. Use in Authorization header for protected routes

## 📊 Check Database

Your data is being saved to MongoDB Atlas:
- Database: `odooXamalthea`
- Collections: `users`, `companies`, `expenses`

To verify:
1. Log into MongoDB Atlas
2. Browse Collections
3. You should see your registered company and admin user

## 🐛 Troubleshooting

### Frontend Not Connecting to Backend?
Check:
- Backend server running on port 5000
- Frontend .env has `VITE_API_URL=http://localhost:5000/api`
- No CORS errors in browser console

### Login Not Working?
Check:
- Email and password are correct
- Network tab shows 200 response
- Token is stored in localStorage
- Check backend terminal for errors

### Registration Not Working?
Check:
- All fields are filled
- Passwords match
- Email is unique
- Country is selected
- Check backend terminal for errors

## 🔍 Debugging Tips

### Check Backend Logs
Look at the terminal running `nodemon index.js`:
- Should show incoming requests
- Should show MongoDB queries
- Any errors will appear here

### Check Frontend Console
Press F12 in browser:
- **Console Tab:** JavaScript errors
- **Network Tab:** API calls and responses
- **Application Tab:** localStorage tokens

### Check API Responses
In Network tab, click on any API call:
- **Headers:** Request details
- **Payload:** Data sent
- **Response:** Data received
- **Preview:** Formatted response

## 📝 Next Steps After Testing

Once you verify login/registration works:

1. **Migrate Employee Dashboard** - Replace localStorage with `expenseAPI.getMyExpenses()`
2. **Migrate Manager Dashboard** - Use `expenseAPI.getPendingExpenses()` and approval endpoints
3. **Migrate Admin User Management** - Use `userAPI` for CRUD operations
4. **Test Expense Workflows** - Create, submit, approve, reject expenses
5. **Add Loading Spinners** - Improve UX across all pages
6. **Error Handling** - Add proper error boundaries

## 💡 Pro Tips

- Keep both terminals visible to see real-time logs
- Use React DevTools to inspect component state
- MongoDB Compass to browse database visually
- Create multiple test users with different roles
- Test token refresh by waiting 7 days (or manually expire token)

## 🎉 You're Ready!

The integration is working! Test it now and let me know if you encounter any issues.

**Current Status:**
- ✅ Backend running and connected to MongoDB
- ✅ Frontend running with Vite
- ✅ Login integrated with API
- ✅ Registration integrated with API
- ✅ Token management configured
- ⏳ Dashboard pages need migration
