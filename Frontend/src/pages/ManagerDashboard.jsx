// Frontend/src/pages/ManagerDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock data: Expenses for different tabs
const initialWaitingApproval = [
    { id: 3, employee: 'Charlie D.', amount: '800.00', currency: 'EUR', category: 'Software', date: '2025-10-03', status: 'Waiting Approval' },
    { id: 4, employee: 'Diana M.', amount: '1500.00', currency: 'INR', category: 'Travel', date: '2025-10-04', status: 'Waiting Approval' },
];

const initialApprovedExpenses = [
    { id: 5, employee: 'Eve L.', amount: '300.00', currency: 'USD', category: 'Meals', date: '2025-09-28', status: 'Approved' },
    { id: 6, employee: 'Frank P.', amount: '650.00', currency: 'INR', category: 'Office Supplies', date: '2025-09-29', status: 'Approved' },
];

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('waitingApproval'); // 'waitingApproval', 'approved', 'reviewed'
    const [waitingApproval, setWaitingApproval] = useState([]);
    const [approvedExpenses, setApprovedExpenses] = useState([]);
    const [reviewedExpenses, setReviewedExpenses] = useState([]);

    // Function to load expenses from localStorage
    const loadExpenses = () => {
        const storedWaiting = JSON.parse(localStorage.getItem('managerWaitingApproval')) || initialWaitingApproval;
        const storedApproved = JSON.parse(localStorage.getItem('managerApproved')) || initialApprovedExpenses;
        const storedReviewed = JSON.parse(localStorage.getItem('managerReviewed')) || [];
        
        setWaitingApproval(storedWaiting);
        setApprovedExpenses(storedApproved);
        setReviewedExpenses(storedReviewed);
        
        console.log('Manager Dashboard - Loaded expenses:', {
            waiting: storedWaiting.length,
            approved: storedApproved.length,
            reviewed: storedReviewed.length
        });
    };

    // Load expenses from localStorage on mount and when navigating back
    useEffect(() => {
        loadExpenses();
        
        // Add event listener for storage changes
        const handleStorageChange = () => {
            loadExpenses();
        };
        
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', loadExpenses);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', loadExpenses);
        };
    }, []);

    // FUTURE: Fetch data from backend: GET /api/expenses/pending
    
    const getCurrentExpenses = () => {
        switch (activeTab) {
            case 'waitingApproval':
                return waitingApproval;
            case 'approved':
                return approvedExpenses;
            case 'reviewed':
                return reviewedExpenses;
            default:
                return [];
        }
    };

    const handleViewDetail = (expenseId) => {
        navigate(`/manager/approval/${expenseId}`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Waiting Approval': return '#ffc107';
            case 'Approved': return '#28a745';
            case 'Reviewed': return '#17a2b8';
            default: return '#333';
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2>Manager's Dashboard</h2>
                    <p>Review and approve expense submissions</p>
                </div>
                <button onClick={loadExpenses} style={styles.refreshButton}>
                    🔄 Refresh
                </button>
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
                        ...(activeTab === 'reviewed' ? styles.activeTab : {})
                    }}
                    onClick={() => setActiveTab('reviewed')}
                >
                    Reviewed
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
            </div>

            {/* Expenses Table */}
            <div style={styles.tableContainer}>
                <h3 style={styles.tableTitle}>
                    {activeTab === 'waitingApproval' && 'Expenses Waiting for Approval'}
                    {activeTab === 'reviewed' && 'Reviewed Expenses'}
                    {activeTab === 'approved' && 'Approved Expenses'}
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
                                            onClick={() => handleViewDetail(expense.id)}
                                            style={styles.actionButton}
                                        >
                                            View Details
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
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid #333',
        paddingBottom: '15px',
    },
    refreshButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    tabContainer: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid #ddd',
    },
    tab: {
        padding: '12px 30px',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '3px solid transparent',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '500',
        color: '#666',
        transition: 'all 0.3s',
    },
    activeTab: {
        borderBottom: '3px solid #007bff',
        color: '#007bff',
        fontWeight: '600',
    },
    tableContainer: {
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
    },
    tableTitle: {
        marginBottom: '20px',
        color: '#333',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    th: {
        backgroundColor: '#333',
        color: 'white',
        padding: '12px',
        textAlign: 'left',
        fontSize: '14px',
        fontWeight: '600',
    },
    tr: {
        borderBottom: '1px solid #ddd',
    },
    td: {
        padding: '12px',
        fontSize: '14px',
    },
    statusBadge: {
        padding: '4px 12px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block',
    },
    actionButton: {
        padding: '6px 16px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '13px',
    },
    emptyState: {
        textAlign: 'center',
        padding: '40px',
        color: '#666',
        fontStyle: 'italic',
    },
};

export default ManagerDashboard;