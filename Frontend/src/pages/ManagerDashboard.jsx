// Frontend/src/pages/ManagerDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseAPI, authAPI } from '../services/api';



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
    const [allExpenses, setAllExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load expenses from API
    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Get all expenses and filter by status on frontend
            const response = await expenseAPI.getAllExpenses();
            console.log('Manager Dashboard - API Response:', response);
            
            // Set all expenses - filtering will be done in render
            if (response.success && response.data) {
                setAllExpenses(response.data);
            } else {
                setAllExpenses([]);
            }
        } catch (error) {
            console.error('Error loading expenses:', error);
            setError('Failed to load expenses. Please try again.');
            setAllExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    // Filter expenses based on status
    const getCurrentExpenses = () => {
        const statusMap = {
            'waitingApproval': ['Pending', 'Awaiting Approval', 'Awaiting Admin Review', 'Submitted'],
            'approved': ['Approved'],
            'rejected': ['Rejected']
        };
        
        const statusesToShow = statusMap[activeTab] || [];
        return allExpenses.filter(expense => 
            statusesToShow.includes(expense.status)
        );
    };

    // Handle approve expense
    const handleApprove = async (expenseId, comments = '') => {
        try {
            await expenseAPI.approveExpense(expenseId, comments);
            // Reload expenses to get updated data
            loadExpenses();
            alert('Expense approved successfully!');
        } catch (error) {
            console.error('Error approving expense:', error);
            alert('Failed to approve expense. Please try again.');
        }
    };

    // Handle reject expense
    const handleReject = async (expenseId, comments = '') => {
        try {
            await expenseAPI.rejectExpense(expenseId, comments);
            // Reload expenses to get updated data
            loadExpenses();
            alert('Expense rejected successfully!');
        } catch (error) {
            console.error('Error rejecting expense:', error);
            alert('Failed to reject expense. Please try again.');
        }
    };

    const handleViewDetail = (expenseId, expense) => {
        // Pass the expense status to determine if it's read-only
        const isReadOnly = expense.status === 'approved' || expense.status === 'rejected';
        navigate(`/manager/approval/${expenseId}`, { 
            state: { 
                isReadOnly: isReadOnly,
                fromTab: activeTab,
                expense: expense,
                onApprove: handleApprove,
                onReject: handleReject
            } 
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
            case 'Submitted':
            case 'Awaiting Approval':
            case 'Awaiting Admin Review': 
                return '#ffc107';
            case 'Approved': 
                return '#10b981'; // Green
            case 'Rejected': 
                return '#ef4444'; // Red
            default: return '#6b7280';
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '400px' 
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                            fontSize: '24px', 
                            marginBottom: '16px'
                        }}>⏳</div>
                        <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading expenses...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '400px' 
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                            fontSize: '24px', 
                            marginBottom: '16px'
                        }}>❌</div>
                        <p style={{ color: '#ef4444', fontSize: '16px' }}>{error}</p>
                        <button 
                            onClick={loadExpenses}
                            style={{
                                marginTop: '16px',
                                padding: '8px 16px',
                                backgroundColor: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Manager's Dashboard</h2>
                    <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>Review and approve expense submissions</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={handleLogout} 
                        style={styles.logoutButton}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#dc2626';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#ef4444';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.2)';
                        }}
                    >
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
                                <tr key={expense._id || expense.id} style={styles.tr}>
                                    <td style={styles.td}>{expense._id || expense.id}</td>
                                    <td style={styles.td}>{expense.employee?.name || expense.employee?.username || 'N/A'}</td>
                                    <td style={styles.td}>{expense.amount}</td>
                                    <td style={styles.td}>{expense.currency?.code || expense.currency?.symbol || 'USD'}</td>
                                    <td style={styles.td}>{expense.category}</td>
                                    <td style={styles.td}>{new Date(expense.date).toLocaleDateString()}</td>
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
                                            onClick={() => handleViewDetail(expense._id || expense.id, expense)}
                                            style={styles.actionButton}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = '#5568d3';
                                                e.target.style.transform = 'translateY(-1px)';
                                                e.target.style.boxShadow = '0 2px 6px rgba(102, 126, 234, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = '#667eea';
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = 'none';
                                            }}
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
        transition: 'all 0.3s ease',
        transform: 'translateY(0)',
        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
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
        transition: 'all 0.3s ease',
        transform: 'translateY(0)',
        boxShadow: '0 2px 4px rgba(102, 126, 234, 0.2)',
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
        transition: 'all 0.3s ease',
        transform: 'translateY(0)',
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#6b7280',
        fontStyle: 'italic',
    },
};

export default ManagerDashboard;