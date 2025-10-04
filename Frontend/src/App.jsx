// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminRegister from './pages/AdminRegister';
import ExpenseForm from './components/ExpenseForm'; // Phase 2
import ManagerDashboard from './pages/ManagerDashboard'; // Phase 2
import EmployeeDashboard from './pages/EmployeeDashboard'; // Phase 3
import AdminApprovalConfig from './pages/AdminApprovalConfig'; // Phase 3
import Login from "./pages/Login";
import AdminUserManagement from './pages/AdminUserManagement';

// New pages
import ExpenseSubmissionPage from './pages/ExpenseSubmissionPage';
import ManagerApprovalDetail from './pages/ManagerApprovalDetail';
import AdminMainDashboard from './pages/AdminMainDashboard';
import DraftExpensesPage from './pages/DraftExpensesPage';
import NewExpenseSubmission from './pages/NewExpenseSubmission';

const Layout = ({ children }) => (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
        <header style={{ padding: '15px', backgroundColor: '#f4f4f4', borderBottom: '1px solid #ddd' }}>
            Expense Manager
        </header>
        <main>{children}</main>
    </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          
          {/* Employee Routes */}
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/submit" element={<ExpenseForm />} />
          <Route path="/employee/submit-expense" element={<ExpenseSubmissionPage />} />
          <Route path="/employee/new-expense" element={<NewExpenseSubmission />} />
          <Route path="/employee/drafts" element={<DraftExpensesPage />} />
          <Route path="/employee/history" element={<EmployeeDashboard />} />
          
          {/* Manager Routes */}
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/approvals" element={<ManagerDashboard />} />
          <Route path="/manager/approval/:expenseId" element={<ManagerApprovalDetail />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminMainDashboard />} />
          <Route path="/admin/users" element={<AdminUserManagement />} />
          <Route path="/admin/config" element={<AdminApprovalConfig />} />
          <Route path="/admin/approval-config" element={<AdminApprovalConfig />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;