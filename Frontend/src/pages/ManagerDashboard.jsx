// Frontend/src/pages/ManagerDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock data: Expenses for different tabs
const initialWaitingApproval = [
    { 
        id: 101, 
        employee: 'John Smith', 
        amount: '1250.00', 
        currency: 'USD', 
        category: 'Travel', 
        date: '2025-10-01', 
        status: 'Waiting Approval',
        description: 'Flight tickets to New York',
        paidBy: 'John Smith'
    },
    { 
        id: 102, 
        employee: 'Sarah Johnson', 
        amount: '2500.00', 
        currency: 'EUR', 
        category: 'Conference', 
        date: '2025-10-02', 
        status: 'Waiting Approval',
        description: 'Tech Summit 2025 registration',
        paidBy: 'Sarah Johnson'
    },
    { 
        id: 103, 
        employee: 'Michael Chen', 
        amount: '450.00', 
        currency: 'USD', 
        category: 'Meals', 
        date: '2025-10-03', 
        status: 'Waiting Approval',
        description: 'Client dinner meeting',
        paidBy: 'Michael Chen'
    },
    { 
        id: 104, 
        employee: 'Emily Davis', 
        amount: '3200.00', 
        currency: 'INR', 
        category: 'Equipment', 
        date: '2025-10-03', 
        status: 'Waiting Approval',
        description: 'Laptop accessories and monitor',
        paidBy: 'Emily Davis'
    },
    { 
        id: 105, 
        employee: 'Alex Martinez', 
        amount: '180.00', 
        currency: 'USD', 
        category: 'Office Supplies', 
        date: '2025-10-04', 
        status: 'Waiting Approval',
        description: 'Stationery and notebooks',
        paidBy: 'Alex Martinez'
    },
];

const initialApprovedExpenses = [
    { 
        id: 201, 
        employee: 'David Wilson', 
        amount: '850.00', 
        currency: 'USD', 
        category: 'Travel', 
        date: '2025-09-25', 
        status: 'Approved',
        description: 'Taxi and airport transfers',
        paidBy: 'David Wilson',
        reviewedDate: '2025-09-26',
        approvalHistory: [
            { approver: 'Manager', status: 'approved', timestamp: '2025-09-26T10:30:00' }
        ]
    },
    { 
        id: 202, 
        employee: 'Lisa Anderson', 
        amount: '1500.00', 
        currency: 'EUR', 
        category: 'Training', 
        date: '2025-09-26', 
        status: 'Approved',
        description: 'Online course certification',
        paidBy: 'Lisa Anderson',
        reviewedDate: '2025-09-27',
        approvalHistory: [
            { approver: 'Manager', status: 'approved', timestamp: '2025-09-27T14:15:00' }
        ]
    },
    { 
        id: 203, 
        employee: 'Robert Taylor', 
        amount: '320.00', 
        currency: 'USD', 
        category: 'Meals', 
        date: '2025-09-27', 
        status: 'Approved',
        description: 'Team lunch meeting',
        paidBy: 'Robert Taylor',
        reviewedDate: '2025-09-28',
        approvalHistory: [
            { approver: 'Manager', status: 'approved', timestamp: '2025-09-28T09:45:00' }
        ]
    },
    { 
        id: 204, 
        employee: 'Jennifer Lee', 
        amount: '5400.00', 
        currency: 'INR', 
        category: 'Software', 
        date: '2025-09-28', 
        status: 'Approved',
        description: 'Annual software licenses',
        paidBy: 'Jennifer Lee',
        reviewedDate: '2025-09-29',
        approvalHistory: [
            { approver: 'Manager', status: 'approved', timestamp: '2025-09-29T11:20:00' }
        ]
    },
    { 
        id: 205, 
        employee: 'Chris Brown', 
        amount: '680.00', 
        currency: 'USD', 
        category: 'Transportation', 
        date: '2025-09-29', 
        status: 'Approved',
        description: 'Monthly parking pass',
        paidBy: 'Chris Brown',
        reviewedDate: '2025-09-30',
        approvalHistory: [
            { approver: 'Manager', status: 'approved', timestamp: '2025-09-30T16:00:00' }
        ]
    },
    { 
        id: 206, 
        employee: 'Amanda White', 
        amount: '420.00', 
        currency: 'EUR', 
        category: 'Office Supplies', 
        date: '2025-09-30', 
        status: 'Approved',
        description: 'Printer cartridges and paper',
        paidBy: 'Amanda White',
        reviewedDate: '2025-10-01',
        approvalHistory: [
            { approver: 'Manager', status: 'approved', timestamp: '2025-10-01T10:00:00' }
        ]
    },
];

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('waitingApproval'); // 'waitingApproval', 'approved', 'rejected'
    const [waitingApproval, setWaitingApproval] = useState([]);
    const [approvedExpenses, setApprovedExpenses] = useState([]);
    const [rejectedExpenses, setRejectedExpenses] = useState([]);

    // Load expenses from localStorage on mount
    useEffect(() => {
        const storedWaiting = JSON.parse(localStorage.getItem('managerWaitingApproval'));
        const storedApproved = JSON.parse(localStorage.getItem('managerApproved'));
        const storedRejected = JSON.parse(localStorage.getItem('managerRejected')) || [];
        
        // If no data in localStorage, use initial dummy data and save it
        if (!storedWaiting || storedWaiting.length === 0) {
            localStorage.setItem('managerWaitingApproval', JSON.stringify(initialWaitingApproval));
            setWaitingApproval(initialWaitingApproval);
        } else {
            setWaitingApproval(storedWaiting);
        }
        
        if (!storedApproved || storedApproved.length === 0) {
            localStorage.setItem('managerApproved', JSON.stringify(initialApprovedExpenses));
            setApprovedExpenses(initialApprovedExpenses);
        } else {
            setApprovedExpenses(storedApproved);
        }
        
        setRejectedExpenses(storedRejected);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    const handleResetDemoData = () => {
        if (confirm('Reset to demo data? This will clear all current expenses and restore initial sample data.')) {
            localStorage.setItem('managerWaitingApproval', JSON.stringify(initialWaitingApproval));
            localStorage.setItem('managerApproved', JSON.stringify(initialApprovedExpenses));
            localStorage.setItem('managerRejected', JSON.stringify([]));
            
            setWaitingApproval(initialWaitingApproval);
            setApprovedExpenses(initialApprovedExpenses);
            setRejectedExpenses([]);
            
            alert('Demo data has been reset successfully!');
        }
    };

    // FUTURE: Fetch data from backend: GET /api/expenses/pending
    
    const getCurrentExpenses = () => {
        switch (activeTab) {
            case 'waitingApproval':
                return waitingApproval;
            case 'approved':
                return approvedExpenses;
            case 'rejected':
                return rejectedExpenses;
            default:
                return [];
        }
    };

    const handleViewDetail = (expenseId, expense) => {
        // Pass the expense status to determine if it's read-only
        const isReadOnly = expense.status === 'Approved' || expense.status === 'approved' || 
                          expense.status === 'Rejected' || expense.status === 'rejected';
        navigate(`/manager/approval/${expenseId}`, { 
            state: { 
                isReadOnly: isReadOnly,
                fromTab: activeTab,
                expense: expense
            } 
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Waiting Approval': return '#ffc107';
            case 'Approved': 
            case 'approved': 
                return '#10b981'; // Green
            case 'Rejected': 
            case 'rejected': 
                return '#ef4444'; // Red
            default: return '#6b7280';
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Manager's Dashboard</h2>
                    <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>Review and approve expense submissions</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleResetDemoData} style={styles.resetButton}>
                        🔄 Reset Demo Data
                    </button>
                    <button onClick={handleLogout} style={styles.logoutButton}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={styles.tabContainer}>
                <button 
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'waitingApproval' ? styles.activeTab : {})
                    }}
                    onClick={() => setActiveTab('waitingApproval')}
                >
                    Waiting Approval
                </button>
                <button 
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'approved' ? styles.activeTab : {})
                    }}
                    onClick={() => setActiveTab('approved')}
                >
                    Approved
                </button>
                <button 
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'rejected' ? styles.activeTab : {})
                    }}
                    onClick={() => setActiveTab('rejected')}
                >
                    Rejected
                </button>
            </div>

            {/* Expenses Table */}
            <div style={styles.tableContainer}>
                <h3 style={styles.tableTitle}>
                    {activeTab === 'waitingApproval' && 'Expenses Waiting for Approval'}
                    {activeTab === 'approved' && 'Approved Expenses'}
                    {activeTab === 'rejected' && 'Rejected Expenses'}
                </h3>

                {getCurrentExpenses().length === 0 ? (
                    <div style={styles.emptyState}>
                        <p>No expenses in this category</p>
                    </div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Employee</th>
                                <th style={styles.th}>Amount</th>
                                <th style={styles.th}>Currency</th>
                                <th style={styles.th}>Category</th>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getCurrentExpenses().map(expense => (
                                <tr key={expense.id} style={styles.tr}>
                                    <td style={styles.td}>{expense.id}</td>
                                    <td style={styles.td}>{expense.employee}</td>
                                    <td style={styles.td}>{expense.amount}</td>
                                    <td style={styles.td}>{expense.currency}</td>
                                    <td style={styles.td}>{expense.category}</td>
                                    <td style={styles.td}>{expense.date}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.statusBadge,
                                            backgroundColor: getStatusColor(expense.status)
                                        }}>
                                            {expense.status}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <button 
                                            onClick={() => handleViewDetail(expense.id, expense)}
                                            style={styles.actionButton}
                                        >
                                            {activeTab === 'waitingApproval' ? 'Review' : 'View Details'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        padding: '20px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        padding: '24px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    logoutButton: {
        padding: '10px 20px',
        backgroundColor: '#ef4444',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
    resetButton: {
        padding: '10px 20px',
        backgroundColor: '#667eea',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
    tabContainer: {
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        backgroundColor: '#ffffff',
        padding: '8px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    tab: {
        padding: '12px 24px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: '#6b7280',
        transition: 'all 0.2s',
    },
    activeTab: {
        backgroundColor: '#667eea',
        color: '#ffffff',
        fontWeight: '600',
    },
    tableContainer: {
        backgroundColor: '#ffffff',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    tableTitle: {
        marginBottom: '20px',
        color: '#1a1a1a',
        fontSize: '18px',
        fontWeight: '600',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
    },
    th: {
        backgroundColor: '#f8f9fa',
        color: '#374151',
        padding: '16px',
        textAlign: 'left',
        fontSize: '14px',
        fontWeight: '600',
        borderBottom: '1px solid #e5e7eb',
    },
    tr: {
        borderBottom: '1px solid #e5e7eb',
        transition: 'background-color 0.2s',
    },
    td: {
        padding: '16px',
        fontSize: '14px',
        color: '#1a1a1a',
    },
    statusBadge: {
        padding: '6px 12px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block',
    },
    actionButton: {
        padding: '8px 16px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#6b7280',
        fontStyle: 'italic',
    },
};

export default ManagerDashboard;