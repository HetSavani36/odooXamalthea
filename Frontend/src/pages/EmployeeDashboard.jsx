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

    return (
        <div style={dashboardStyle}>
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
                        <span style={summaryAmount}>{totals.approved.toFixed(2)} rs</span>
                    </div>
                    <div style={summaryCardBody}>
                        <span style={summaryLabel}>Approved</span>
                    </div>
                </div>

                <div style={arrowStyle}>→</div>

                <div style={{ ...summaryCard, backgroundColor: '#ffebee' }}>
                    <div style={summaryCardHeader}>
                        <span style={{ ...summaryAmount, color: '#dc3545' }}>{totals.rejected.toFixed(2)} rs</span>
                    </div>
                    <div style={summaryCardBody}>
                        <span style={{ ...summaryLabel, color: '#dc3545' }}>Rejected</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '30px' }}>
                <h2>My Expense History</h2>
                <button 
                    onClick={() => navigate('/employee/new-expense')}
                    style={newExpenseButtonStyle}
                >
                    + New Expense
                </button>
            </div>

            {allExpenses.length === 0 ? (
                <div style={emptyStateStyle}>
                    <p style={{ fontSize: '48px', margin: '0' }}>📊</p>
                    <h3>No Expenses Yet</h3>
                    <p>Create your first expense report to get started.</p>
                    <button 
                        onClick={() => navigate('/employee/new-expense')}
                        style={newExpenseButtonStyle}
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
                                            >
                                                Edit
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => setSelectedExpense(exp)} 
                                                style={buttonStyle}
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
                            <h3>Details for {selectedExpense.description}</h3>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Amount:</strong> {selectedExpense.totalAmount || selectedExpense.amount} {selectedExpense.currency}<br />
                                <strong>Category:</strong> {selectedExpense.category}<br />
                                <strong>Date:</strong> {selectedExpense.expenseDate}<br />
                                <strong>Paid By:</strong> {selectedExpense.paidBy}<br />
                                <strong>Remarks:</strong> {selectedExpense.remarks || 'None'}<br />
                                <strong>Status:</strong> <span style={getStatusStyle(selectedExpense.status)}>{getStatusBadge(selectedExpense.status)}</span>
                            </div>
                            
                            {selectedExpense.history && selectedExpense.history.length > 0 && (
                                <>
                                    <h4>Approval History:</h4>
                                    {selectedExpense.history.map(step => (
                                        <div key={step.id} style={stepStyle}>
                                            <strong>{step.approver}</strong><br />
                                            Decision: <span style={getStatusStyle(step.status)}>{step.status}</span> 
                                            {step.time && ` on ${step.time}`}
                                        </div>
                                    ))}
                                </>
                            )}
                            
                            <button 
                                onClick={() => setSelectedExpense(null)} 
                                style={{ ...buttonStyle, marginTop: '15px' }}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// Simple CSS styles
const dashboardStyle = { padding: '20px', maxWidth: '1200px', margin: '20px auto' };
const tableStyle = { 
    width: '100%', 
    borderCollapse: 'collapse', 
    marginTop: '15px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};
const thStyle = {
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #dee2e6',
    textAlign: 'left',
    fontWeight: '600'
};
const tdStyle = {
    padding: '12px',
    borderBottom: '1px solid #dee2e6'
};
const trStyle = {
    ':hover': { backgroundColor: '#f8f9fa' }
};
const buttonStyle = { 
    padding: '6px 12px', 
    backgroundColor: '#007bff', 
    color: 'white', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer',
    fontSize: '13px'
};
const editButtonStyle = { 
    padding: '6px 12px', 
    backgroundColor: '#28a745', 
    color: 'white', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer',
    fontSize: '13px'
};
const newExpenseButtonStyle = { 
    padding: '10px 20px', 
    backgroundColor: '#007bff', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600'
};
const detailBoxStyle = { 
    marginTop: '20px', 
    padding: '20px', 
    border: '1px solid #dee2e6', 
    borderRadius: '6px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};
const stepStyle = { 
    marginBottom: '10px', 
    padding: '12px', 
    borderLeft: '3px solid #007bff', 
    background: '#f8f9fa',
    borderRadius: '4px'
};
const emptyStateStyle = {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};
const summaryCardsContainer = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '2px solid #333'
};
const summaryCard = {
    flex: 1,
    padding: '20px',
    textAlign: 'center',
    borderRadius: '6px',
    backgroundColor: '#f8f9fa'
};
const summaryCardHeader = {
    marginBottom: '10px'
};
const summaryAmount = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333'
};
const summaryCardBody = {
    marginTop: '8px'
};
const summaryLabel = {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
};
const arrowStyle = {
    fontSize: '32px',
    color: '#333',
    fontWeight: 'bold'
};

export default EmployeeDashboard;
