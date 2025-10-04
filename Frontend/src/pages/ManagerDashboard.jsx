// Frontend/src/pages/ManagerDashboard.jsx

import React, { useState } from 'react';

// Mock data: Expenses pending approval for the manager
const mockExpenses = [
    { id: 1, employee: 'Alice J.', amount: '500.00', submittedCurrency: 'INR', convertedAmount: '6.00', companyCurrency: 'USD', category: 'Meals', date: '2025-10-01' },
    { id: 2, employee: 'Bob K.', amount: '120.50', submittedCurrency: 'USD', convertedAmount: '120.50', companyCurrency: 'USD', category: 'Travel', date: '2025-10-02' },
    { id: 3, employee: 'Charlie D.', amount: '800.00', submittedCurrency: 'EUR', convertedAmount: '870.00', companyCurrency: 'USD', category: 'Software', date: '2025-10-03' },
];

const ManagerDashboard = ({ companyCurrency = 'USD' }) => {
    const [pendingExpenses, setPendingExpenses] = useState(mockExpenses);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [comment, setComment] = useState('');

    // FUTURE: Fetch data from backend: GET /api/expenses/pending
    
    const handleAction = (expenseId, action) => {
        // 1. FUTURE: Send action to backend: POST /api/expenses/:id/approve or /reject
        console.log(`Action: ${action} on Expense ID: ${expenseId} with comment: "${comment}"`);
        
        // 2. Update local state to simulate removal from the queue
        setPendingExpenses(prev => prev.filter(exp => exp.id !== expenseId));
        setSelectedExpense(null);
        setComment('');
    };

    const renderExpenseDetail = () => {
        if (!selectedExpense) return null;

        return (
            <div style={detailBoxStyle}>
                <h4>Approval for Expense #{selectedExpense.id}</h4>
                <p><strong>Employee:</strong> {selectedExpense.employee}</p>
                <p><strong>Submitted:</strong> {selectedExpense.amount} {selectedExpense.submittedCurrency}</p>
                <p><strong>Converted:</strong> {selectedExpense.convertedAmount} {selectedExpense.companyCurrency} (Company Currency)</p>
                <p><strong>Category:</strong> {selectedExpense.category}</p>
                
                <hr />
                <label style={{display: 'block', marginBottom: '5px'}}>Comment (Required for Rejection)</label>
                <textarea 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)} 
                    style={{ width: '100%', minHeight: '80px', marginTop: '5px', padding: '8px' }}
                />
                
                <div style={detailButtonContainerStyle}>
                    <button 
                        style={{ ...buttonStyle, backgroundColor: 'green', marginRight: '10px' }} 
                        onClick={() => handleAction(selectedExpense.id, 'Approved')}
                    >
                        Approve
                    </button>
                    <button 
                        style={{ ...buttonStyle, backgroundColor: 'red' }} 
                        onClick={() => handleAction(selectedExpense.id, 'Rejected')}
                        disabled={!comment.trim()} // Require comment for rejection
                    >
                        Reject
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div style={dashboardStyle}>
            <h2>Manager Approval Queue</h2>
            <div style={contentLayout}>
                <div style={listStyle}>
                    <h3>Expenses Waiting for My Approval ({pendingExpenses.length})</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Amount ({companyCurrency})</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingExpenses.map(exp => (
                                <tr key={exp.id}>
                                    <td>{exp.employee}</td>
                                    <td>{exp.convertedAmount} {exp.companyCurrency}</td>
                                    <td>{exp.date}</td>
                                    <td>
                                        <button onClick={() => setSelectedExpense(exp)} style={{ ...buttonStyle, padding: '5px 10px' }}>
                                            View & Act
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={detailStyle}>
                    {renderExpenseDetail()}
                </div>
            </div>
        </div>
    );
};

// Simple CSS styles
const dashboardStyle = { padding: '20px' };
const contentLayout = { display: 'flex', gap: '20px' };
const listStyle = { flex: 2, paddingRight: '20px' };
const detailStyle = { flex: 1 };
const detailBoxStyle = { border: '1px solid #007bff', padding: '15px', borderRadius: '4px' };
const detailButtonContainerStyle = { marginTop: '15px', display: 'flex', justifyContent: 'flex-end' };
const buttonStyle = { padding: '8px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' };

export default ManagerDashboard;