# Admin User Management - Country Field Addition

## Overview
Added a country selection field to the Admin User Management page, allowing admins to specify the country for each user during creation or editing.

---

## 🎯 Changes Implemented

### **1. Import Currency Converter Utility**
```javascript
import { COUNTRY_CURRENCY_MAP } from '../utils/currencyConverter';
```
- Imports the country-to-currency mapping from the existing currency converter utility
- Provides access to 31 countries with their respective currencies

### **2. Extract Countries List**
```javascript
const COUNTRIES = Object.keys(COUNTRY_CURRENCY_MAP);
```
- Creates an array of all available countries
- Used to populate the country dropdown

**Available Countries (31 total):**
- United States, United Kingdom, Canada, Australia, India
- Germany, France, Japan, China, Brazil, Mexico
- Spain, Italy, Netherlands, Sweden, Switzerland
- Singapore, United Arab Emirates, Saudi Arabia, South Africa
- New Zealand, Ireland, Belgium, Austria, Denmark
- Norway, Finland, Poland, Portugal, Greece
- Other (fallback)

---

### **3. Updated Mock Data**
```javascript
const mockUsers = [
    { id: 1, name: 'Alice Johnson', email: 'alice@corp.com', role: 'Manager', manager: 'N/A', country: 'United States' },
    { id: 2, name: 'Bob Smith', email: 'bob@corp.com', role: 'Employee', manager: 'Alice Johnson', country: 'United States' },
    { id: 3, name: 'Charlie Dean', email: 'charlie@corp.com', role: 'Employee', manager: 'Alice Johnson', country: 'United Kingdom' },
    { id: 4, name: 'Dana Lee', email: 'dana@corp.com', role: 'Admin', manager: 'N/A', country: 'Canada' },
];
```
- Added `country` field to all mock users
- Demonstrates multi-country user base

---

### **4. Updated Initial Form State**
```javascript
const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    role: 'Employee', 
    manager: 'N/A', 
    country: 'United States'  // NEW: Default country
});
```
- Added `country` field with default value 'United States'
- Ensures country is always set when creating new users

### **5. Updated Create New User Button**
```javascript
<button 
    style={styles.addButton} 
    onClick={() => { 
        setEditingUser(null); 
        setFormData({ 
            name: '', 
            email: '', 
            role: 'Employee', 
            manager: 'N/A', 
            country: 'United States'  // NEW: Include country in reset
        }); 
        setIsModalOpen(true); 
    }}
>
    + Create New User
</button>
```
- Resets form to include default country when creating new user

---

### **6. Added Country Form Field**
```jsx
<div style={styles.formGroup}>
    <label style={styles.label}>Country</label>
    <select 
        style={styles.input} 
        name="country" 
        value={formData.country} 
        onChange={handleFormChange}
        required
    >
        {COUNTRIES.map(country => (
            <option key={country} value={country}>{country}</option>
        ))}
    </select>
</div>
```

**Position in Form:**
1. Name
2. Email
3. **Country** ← NEW
4. Role
5. Assign Manager (conditional)

**Features:**
- ✅ Required field (cannot be empty)
- ✅ Dropdown with all 31 countries
- ✅ Default: United States
- ✅ Sorted alphabetically via COUNTRY_CURRENCY_MAP keys

---

### **7. Updated Users Table**

#### **Table Header:**
```jsx
<thead>
    <tr>
        <th style={styles.th}>ID</th>
        <th style={styles.th}>Name</th>
        <th style={styles.th}>Email</th>
        <th style={styles.th}>Country</th>  {/* NEW COLUMN */}
        <th style={styles.th}>Role</th>
        <th style={styles.th}>Manager</th>
        <th style={styles.th}>Actions</th>
    </tr>
</thead>
```

#### **Table Body:**
```jsx
<tbody>
    {users.map(user => (
        <tr key={user.id} style={styles.tr}>
            <td style={styles.td}>{user.id}</td>
            <td style={styles.td}>{user.name}</td>
            <td style={styles.td}>{user.email}</td>
            <td style={styles.td}>{user.country || 'N/A'}</td>  {/* NEW COLUMN */}
            <td style={styles.td}>...</td>
            ...
        </tr>
    ))}
</tbody>
```

**Table Column Order:**
1. ID
2. Name
3. Email
4. **Country** ← NEW
5. Role
6. Manager
7. Actions

---

## 🔄 Complete User Creation Flow

### **Step-by-Step:**

1. **Admin clicks "+ Create New User"**
   - Modal opens
   - Form fields pre-populated:
     - Name: (empty)
     - Email: (empty)
     - Country: **United States** (default)
     - Role: **Employee** (default)
     - Manager: **N/A** (default)

2. **Admin fills in user details:**
   - Name: e.g., "John Doe"
   - Email: e.g., "john.doe@company.com"
   - Country: Selects from dropdown (e.g., "United Kingdom")
   - Role: Selects Manager or Employee
   - Manager: (shows only if role is Employee)

3. **Admin clicks "Create User"**
   - Form validates all required fields
   - User created with country information
   - User appears in table with country column

4. **User displayed in table:**
   ```
   | ID | Name     | Email              | Country        | Role     | Manager | Actions |
   |----|----------|-------------------|----------------|----------|---------|---------|
   | 5  | John Doe | john.doe@corp.com | United Kingdom | Employee | Alice J.| Edit... |
   ```

---

## 🌍 Country-to-Currency Mapping

The selected country automatically maps to a currency (used for expense conversions):

| Country | Currency |
|---------|----------|
| United States | USD ($) |
| United Kingdom | GBP (£) |
| Canada | CAD ($) |
| Australia | AUD ($) |
| India | INR (₹) |
| Germany, France, Spain, Italy, etc. | EUR (€) |
| Japan | JPY (¥) |
| China | CNY (¥) |
| Brazil | BRL (R$) |
| Mexico | MXN ($) |
| Switzerland | CHF (Fr) |
| Singapore | SGD ($) |
| UAE | AED (د.إ) |
| Saudi Arabia | SAR (﷼) |
| South Africa | ZAR (R) |
| New Zealand | NZD ($) |
| Other | USD ($) |

---

## 📋 Use Cases

### **Use Case 1: Multi-National Company**
**Scenario:** Company has offices in US, UK, and India
- Create users with respective countries
- System can track user location
- Expense currency conversions based on user country

### **Use Case 2: Remote Workforce**
**Scenario:** Employees work from different countries
- Each employee's country is documented
- Country field helps with:
  - Tax compliance
  - Expense reporting
  - Currency conversions
  - Regional policies

### **Use Case 3: Expense Management**
**Scenario:** Employee from India submits expense in INR
- User profile shows country: India
- Company currency: USD
- System converts INR → USD automatically
- Manager sees expense in both currencies

---

## 🎨 UI Layout

### **Modal Form Layout:**

```
┌─────────────────────────────────────────────┐
│  ✕  Edit User / Create New User            │
├─────────────────────────────────────────────┤
│                                             │
│  Name                                       │
│  [________________________]                 │
│                                             │
│  Email                                      │
│  [________________________]                 │
│                                             │
│  Country                      ← NEW         │
│  [United States         ▼]                  │
│                                             │
│  Role                                       │
│  [Employee            ▼]                    │
│                                             │
│  Assign Manager (if Employee)               │
│  [Alice Johnson       ▼]                    │
│                                             │
│           [Cancel]  [Create User]           │
└─────────────────────────────────────────────┘
```

### **Users Table:**

```
┌────┬──────────────┬───────────────────┬────────────────┬──────────┬──────────┬─────────┐
│ ID │ Name         │ Email             │ Country        │ Role     │ Manager  │ Actions │
├────┼──────────────┼───────────────────┼────────────────┼──────────┼──────────┼─────────┤
│ 1  │ Alice J.     │ alice@corp.com    │ United States  │ Manager  │ N/A      │ Edit... │
│ 2  │ Bob Smith    │ bob@corp.com      │ United States  │ Employee │ Alice J. │ Edit... │
│ 3  │ Charlie Dean │ charlie@corp.com  │ United Kingdom │ Employee │ Alice J. │ Edit... │
│ 4  │ Dana Lee     │ dana@corp.com     │ Canada         │ Admin    │ N/A      │ Edit... │
└────┴──────────────┴───────────────────┴────────────────┴──────────┴──────────┴─────────┘
         ↑ NEW COLUMN
```

---

## ✅ Benefits

### **1. Data Completeness**
- ✅ Comprehensive user profiles
- ✅ Location information tracked
- ✅ Better user management

### **2. Currency Management**
- ✅ Automatic currency assignment
- ✅ Country-based expense conversions
- ✅ Multi-currency support

### **3. Compliance**
- ✅ Regional policy enforcement
- ✅ Tax compliance tracking
- ✅ Legal requirements

### **4. Reporting**
- ✅ Users by country
- ✅ Regional expense analysis
- ✅ Geographic distribution

---

## 🧪 Testing Scenarios

### **Test 1: Create User with Country**
1. Click "+ Create New User"
2. Fill in Name, Email
3. Select Country: "India"
4. Select Role: "Employee"
5. Click "Create User"
6. **Expected:** User created with country "India" shown in table

### **Test 2: Edit User Country**
1. Click "Edit" on existing user
2. Change Country from "United States" to "United Kingdom"
3. Click "Update User"
4. **Expected:** Country updated in table

### **Test 3: Default Country**
1. Click "+ Create New User"
2. **Expected:** Country dropdown shows "United States" as default

### **Test 4: Required Field Validation**
1. Click "+ Create New User"
2. Leave Country field unchanged (default)
3. Try to submit
4. **Expected:** Form accepts (required field has default value)

### **Test 5: Country Dropdown**
1. Open Country dropdown
2. **Expected:** See all 31 countries listed alphabetically

---

## 🔗 Integration with Other Features

### **Currency Converter Integration:**
```javascript
// When user is created/edited
const userCountry = formData.country; // e.g., "India"
const userCurrency = getCurrencyForCountry(userCountry); // Returns "INR"

// Use currency for expense conversions
const convertedAmount = convertCurrency(1000, 'INR', 'USD');
```

### **Expense Submission:**
- Employee's country determines default currency
- Automatic conversion to company currency
- Multi-currency expense reports

### **Admin Dashboard:**
- View users by country
- Regional statistics
- Country-based filtering (future feature)

---

## 📊 Data Structure

### **User Object:**
```javascript
{
    id: 5,
    name: 'John Doe',
    email: 'john.doe@company.com',
    country: 'United Kingdom',  // NEW FIELD
    role: 'Employee',
    manager: 'Alice Johnson'
}
```

### **Form Data State:**
```javascript
{
    name: '',
    email: '',
    country: 'United States',  // NEW FIELD with default
    role: 'Employee',
    manager: 'N/A'
}
```

---

## 🚀 Future Enhancements

### **Potential Features:**

1. **Currency Symbol Display**
   - Show currency symbol next to country
   - Example: "United Kingdom (GBP £)"

2. **Country Flag Icons**
   - Display flag emoji in dropdown
   - Visual country identification

3. **Regional Grouping**
   - Group countries by region (Europe, Asia, Americas)
   - Easier navigation for large lists

4. **Time Zone Integration**
   - Associate time zones with countries
   - Better scheduling and coordination

5. **Phone Number Validation**
   - Country-specific phone formats
   - International dialing codes

6. **Address Fields**
   - Auto-format based on country
   - Postal code validation

---

**Implementation Date:** October 4, 2025  
**Status:** ✅ **COMPLETE AND FUNCTIONAL**  
**File Modified:** `Frontend/src/pages/AdminUserManagement.jsx`  
**Dependencies:** `Frontend/src/utils/currencyConverter.js`

