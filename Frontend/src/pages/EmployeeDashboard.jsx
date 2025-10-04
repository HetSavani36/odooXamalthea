// Frontend/src/pages/EmployeeDashboard.jsx

import React, { useState } from 'react';

// Mock data: Employee's history showing multi-step approval
const mockExpenseHistory = [
    { 
        id: 101, 
        amount: '500.00', 
        currency: 'INR', 
        category: 'Meals', 
        status: 'Approved', 
        submissionDate: '2025-10-01',
        approvalSteps: [
            { step: 1, approver: 'Jane Doe (Manager)', decision: 'Approved', date: '2025-10-02' },
            { step: 2, approver: 'Finance Team', decision: 'Approved', date: '2025-10-03' }
        ]
    },
    { 
        id: 103, 
        amount: '800.00', 
        currency: 'EUR', 
        category: 'Software', 
        status: 'Rejected', 
        submissionDate: '2025-10-03',
        rejectionComment: 'Not within policy budget for Q4.',
        approvalSteps: [
            { step: 1, approver: 'Jane Doe (Manager)', decision: 'Approved', date: '2025-10-04' },
            { step: 2, approver: 'Mike L. (Director)', decision: 'Rejected', date: '2025-10-05' }
        ]
    },
];

const EmployeeDashboard = () => {
    const [history, setHistory] = useState(mockExpenseHistory);
    const [selectedExpense, setSelectedExpense] = useState(null);

    // FUTURE: Fetch data from backend: GET /api/expenses/my-history
    
    const getStatusStyle = (status) => {
        if (status === 'Approved') return { color: 'green', fontWeight: 'bold' };
        if (status === 'Rejected') return { color: 'red', fontWeight: 'bold' };
        return { color: 'orange', fontWeight: 'bold' };
    };

    return (
        <div style={dashboardStyle}>
            <h2>My Expense History</h2>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Amount</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Submission Date</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map(exp => (
                        <tr key={exp.id}>
                            <td>{exp.id}</td>
                            <td>{exp.amount} {exp.currency}</td>
                            <td>{exp.category}</td>
                            <td style={getStatusStyle(exp.status)}>{exp.status}</td>
                            <td>{exp.submissionDate}</td>
                            <td>
                                <button onClick={() => setSelectedExpense(exp)} style={buttonStyle}>
                                    View Flow
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedExpense && (
                <div style={detailBoxStyle}>
                    <h3>Approval Flow for #{selectedExpense.id}</h3>
                    {selectedExpense.approvalSteps.map(step => (
                        <div key={step.step} style={stepStyle}>
                            <strong>Step {step.step}:</strong> {step.approver} <br/>
                            **Decision:** <span style={getStatusStyle(step.decision)}>{step.decision}</span> 
                            {step.date && ` on ${step.date}`}
                        </div>
                    ))}
                    {selectedExpense.status === 'Rejected' && (
                        <p style={{ color: 'darkred', marginTop: '10px' }}>**Rejection Reason:** {selectedExpense.rejectionComment}</p>
                    )}
                </div>
            )}
        </div>
    );
};

// Simple CSS styles
const dashboardStyle = { padding: '20px', maxWidth: '900px', margin: '20px auto' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '15px' };
const buttonStyle = { padding: '5px 10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const detailBoxStyle = { marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '4px' };
const stepStyle = { marginBottom: '10px', padding: '10px', borderLeft: '3px solid #007bff', background: '#f8f9fa' };


export default EmployeeDashboard;