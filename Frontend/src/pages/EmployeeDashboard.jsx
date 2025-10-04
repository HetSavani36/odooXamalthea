// Frontend/src/pages/EmployeeDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const [allExpenses, setAllExpenses] = useState([]);
    const [selectedExpense, setSelectedExpense] = useState(null);

    // Function to load all expenses from localStorage
    const loadExpenses = () => {
        const drafts = JSON.parse(localStorage.getItem('expenseDrafts') || '[]');
        const submitted = JSON.parse(localStorage.getItem('expenses') || '[]');
        
        // Combine both and sort by date
        const combined = [...drafts, ...submitted].sort((a, b) => {
            const dateA = new Date(a.savedAt || a.submittedAt || a.expenseDate);
            const dateB = new Date(b.savedAt || b.submittedAt || b.expenseDate);
            return dateB - dateA; // Most recent first
        });
        
        setAllExpenses(combined);
        
        console.log('Employee Dashboard - Loaded expenses:', {
            drafts: drafts.length,
            submitted: submitted.length,
            total: combined.length
        });
    };

    // Load all expenses (drafts + submitted) from localStorage
    useEffect(() => {
        loadExpenses();
        
        // Add event listener for when window gets focus (user comes back to this tab)
        window.addEventListener('focus', loadExpenses);
        
        return () => {
            window.removeEventListener('focus', loadExpenses);
        };
    }, []);

    const handleEdit = (expense) => {
        if (expense.status === 'draft') {
            navigate('/employee/new-expense', { state: { expense } });
        } else {
            alert('Only draft expenses can be edited!');
        }
    };

    const getStatusStyle = (status) => {
        if (status === 'approved' || status === 'Approved') return { color: '#28a745', fontWeight: 'bold' };
        if (status === 'rejected' || status === 'Rejected') return { color: '#dc3545', fontWeight: 'bold' };
        if (status === 'pending') return { color: '#ffc107', fontWeight: 'bold' };
        if (status === 'draft') return { color: '#6c757d', fontWeight: 'bold' };
        return { color: '#007bff', fontWeight: 'bold' };
    };

    const getStatusBadge = (status) => {
        const statusText = status === 'draft' ? 'Draft' : 
                          status === 'pending' ? 'Pending Approval' :
                          status === 'approved' ? 'Approved' : 
                          status === 'rejected' ? 'Rejected' : status;
        return statusText;
    };

    // Calculate totals for each status
    const calculateTotals = () => {
        const toSubmit = allExpenses
            .filter(e => e.status === 'draft')
            .reduce((sum, e) => sum + parseFloat(e.totalAmount || 0), 0);
        
        const waitingApproval = allExpenses
            .filter(e => e.status === 'pending')
            .reduce((sum, e) => sum + parseFloat(e.totalAmount || 0), 0);
        
        const approved = allExpenses
            .filter(e => e.status === 'approved')
            .reduce((sum, e) => sum + parseFloat(e.totalAmount || 0), 0);
        
        const rejected = allExpenses
            .filter(e => e.status === 'rejected')
            .reduce((sum, e) => sum + parseFloat(e.totalAmount || 0), 0);
        
        return { toSubmit, waitingApproval, approved, rejected };
    };

    const totals = calculateTotals();

    const handleLogout = () => {
        // Clear any session data if needed
        localStorage.removeItem('currentUser'); // Optional: if you're storing current user
        navigate('/login');
    };

    return (
        <div style={dashboardStyle}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header with Logout Button */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '32px',
                    padding: '24px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#1a1a1a' }}>Employee Dashboard</h1>
                    <button 
                        onClick={handleLogout} 
                        style={logoutButtonStyle}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#dc2626';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#ef4444';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        Logout
                    </button>
                </div>

                {/* Summary Cards Section */}
                <div style={summaryCardsContainer}>
                    <div style={summaryCard}>
                        <div style={summaryCardHeader}>
                            <span style={summaryAmount}>{totals.toSubmit.toFixed(2)} rs</span>
                        </div>
                        <div style={summaryCardBody}>
                            <span style={summaryLabel}>To submit</span>
                        </div>
                    </div>

                    <div style={arrowStyle}>→</div>

                    <div style={summaryCard}>
                        <div style={summaryCardHeader}>
                            <span style={summaryAmount}>{totals.waitingApproval.toFixed(2)} rs</span>
                        </div>
                        <div style={summaryCardBody}>
                            <span style={summaryLabel}>Waiting approval</span>
                        </div>
                    </div>

                    <div style={arrowStyle}>→</div>

                    <div style={summaryCard}>
                        <div style={summaryCardHeader}>
                            <span style={{ ...summaryAmount, color: '#10b981' }}>{totals.approved.toFixed(2)} rs</span>
                        </div>
                        <div style={summaryCardBody}>
                            <span style={summaryLabel}>Approved</span>
                        </div>
                    </div>

                    <div style={arrowStyle}>→</div>

                    <div style={summaryCard}>
                        <div style={summaryCardHeader}>
                            <span style={{ ...summaryAmount, color: '#ef4444' }}>{totals.rejected.toFixed(2)} rs</span>
                        </div>
                        <div style={summaryCardBody}>
                            <span style={summaryLabel}>Rejected</span>
                        </div>
                    </div>
                </div>

                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '20px'
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a' }}>My Expense History</h2>
                    <button 
                        onClick={() => navigate('/employee/new-expense')}
                        style={newExpenseButtonStyle}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#5568d3';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#667eea';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        + New Expense
                    </button>
                </div>

                {allExpenses.length === 0 ? (
                    <div style={emptyStateStyle}>
                        <p style={{ fontSize: '48px', margin: '0' }}>📊</p>
                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginTop: '16px' }}>No Expenses Yet</h3>
                        <p style={{ color: '#6b7280', marginBottom: '24px' }}>Create your first expense report to get started.</p>
                        <button 
                            onClick={() => navigate('/employee/new-expense')}
                            style={newExpenseButtonStyle}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#5568d3';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#667eea';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            + Create Expense
                        </button>
                    </div>
                ) : (
                    <>
                        <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Date</th>
                                <th style={thStyle}>Description</th>
                                <th style={thStyle}>Category</th>
                                <th style={thStyle}>Amount</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allExpenses.map(exp => (
                                <tr key={exp.id} style={trStyle}>
                                    <td style={tdStyle}>{exp.expenseDate}</td>
                                    <td style={tdStyle}>{exp.description || '-'}</td>
                                    <td style={tdStyle}>{exp.category || '-'}</td>
                                    <td style={tdStyle}>{exp.totalAmount || exp.amount} {exp.currency}</td>
                                    <td style={tdStyle}>
                                        <span style={getStatusStyle(exp.status)}>
                                            {getStatusBadge(exp.status)}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        {exp.status === 'draft' ? (
                                            <button 
                                                onClick={() => handleEdit(exp)} 
                                                style={editButtonStyle}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = '#059669';
                                                    e.target.style.transform = 'translateY(-1px)';
                                                    e.target.style.boxShadow = '0 2px 6px rgba(16, 185, 129, 0.3)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = '#10b981';
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            >
                                                Edit
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => setSelectedExpense(exp)} 
                                                style={buttonStyle}
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
                                                View Details
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                        {selectedExpense && selectedExpense.status !== 'draft' && (
                            <div style={detailBoxStyle}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '16px' }}>
                                    Details for {selectedExpense.description}
                                </h3>
                                <div style={{ marginBottom: '20px', lineHeight: '1.8', color: '#374151' }}>
                                    <strong>Amount:</strong> {selectedExpense.totalAmount || selectedExpense.amount} {selectedExpense.currency}<br />
                                    <strong>Category:</strong> {selectedExpense.category}<br />
                                    <strong>Date:</strong> {selectedExpense.expenseDate}<br />
                                    <strong>Paid By:</strong> {selectedExpense.paidBy}<br />
                                    <strong>Remarks:</strong> {selectedExpense.remarks || 'None'}<br />
                                    <strong>Status:</strong> <span style={getStatusStyle(selectedExpense.status)}>{getStatusBadge(selectedExpense.status)}</span>
                                </div>
                                
                                {selectedExpense.history && selectedExpense.history.length > 0 && (
                                    <>
                                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>
                                            Approval History:
                                        </h4>
                                        {selectedExpense.history.map(step => (
                                            <div key={step.id} style={stepStyle}>
                                                <strong style={{ color: '#1a1a1a' }}>{step.approver}</strong><br />
                                                Decision: <span style={getStatusStyle(step.status)}>{step.status}</span> 
                                                {step.time && ` on ${step.time}`}
                                            </div>
                                        ))}
                                    </>
                                )}
                                
                                <button 
                                    onClick={() => setSelectedExpense(null)} 
                                    style={{ ...buttonStyle, marginTop: '20px' }}
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Modern Simple Styles (No Gradients)
const dashboardStyle = { 
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px'
};
const tableStyle = { 
    width: '100%', 
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};
const thStyle = {
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e5e7eb',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '14px',
    color: '#374151'
};
const tdStyle = {
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px',
    color: '#1a1a1a'
};
const trStyle = {
    transition: 'background-color 0.2s'
};
const buttonStyle = { 
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
};
const editButtonStyle = { 
    padding: '8px 16px', 
    backgroundColor: '#10b981', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    transform: 'translateY(0)',
};
const newExpenseButtonStyle = { 
    padding: '12px 24px', 
    backgroundColor: '#667eea', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    transform: 'translateY(0)',
};
const logoutButtonStyle = { 
    padding: '10px 20px', 
    backgroundColor: '#ef4444', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    transform: 'translateY(0)',
};
const detailBoxStyle = { 
    marginTop: '24px', 
    padding: '24px', 
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};
const stepStyle = { 
    marginBottom: '12px', 
    padding: '16px', 
    borderLeft: '3px solid #667eea', 
    background: '#f8f9fa',
    borderRadius: '6px'
};
const emptyStateStyle = {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '0 auto'
};
const summaryCardsContainer = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px',
    padding: '0',
    backgroundColor: 'transparent'
};
const summaryCard = {
    flex: 1,
    padding: '24px',
    textAlign: 'center',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};
const summaryCardHeader = {
    marginBottom: '8px'
};
const summaryAmount = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#667eea'
};
const summaryCardBody = {
    marginTop: '8px'
};
const summaryLabel = {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
};
const arrowStyle = {
    fontSize: '24px',
    color: '#9ca3af',
    fontWeight: 'normal'
};

export default EmployeeDashboard;
