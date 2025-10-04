// Frontend/src/pages/ManagerApprovalDetail.jsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ManagerApprovalDetail = () => {
    const { expenseId } = useParams();
    const navigate = useNavigate();

    // Mock data - FUTURE: Fetch from API
    const [expenseDetail, setExpenseDetail] = useState({
        id: expenseId || 1,
        employee: {
            name: 'Alice Johnson',
            email: 'alice.j@company.com',
            department: 'Engineering',
        },
        submittedDate: '2025-10-01',
        totalAmount: 1420.50,
        currency: 'INR',
        convertedAmount: 17.05,
        companyCurrency: 'USD',
        status: 'Pending Approval',
        items: [
            {
                id: 1,
                date: '2025-09-28',
                category: 'Meals',
                description: 'Team lunch with clients',
                amount: 500,
                currency: 'INR',
                receipt: 'receipt1.pdf',
            },
            {
                id: 2,
                date: '2025-09-29',
                category: 'Travel',
                description: 'Cab to airport',
                amount: 420.50,
                currency: 'INR',
                receipt: 'receipt2.pdf',
            },
            {
                id: 3,
                date: '2025-09-30',
                category: 'Office Supplies',
                description: 'Notebooks and pens',
                amount: 500,
                currency: 'INR',
                receipt: null,
            },
        ],
    });

    const [comment, setComment] = useState('');
    const [action, setAction] = useState(''); // 'approve' or 'reject'

    const handleApprove = () => {
        setAction('approve');
        // FUTURE: POST /api/expenses/:id/approve with comment
        console.log('Approving expense:', expenseDetail.id, 'Comment:', comment);
        alert('Expense approved!');
        navigate('/manager/dashboard');
    };

    const handleReject = () => {
        if (!comment.trim()) {
            alert('Please provide a comment for rejection');
            return;
        }
        setAction('reject');
        // FUTURE: POST /api/expenses/:id/reject with comment
        console.log('Rejecting expense:', expenseDetail.id, 'Comment:', comment);
        alert('Expense rejected!');
        navigate('/manager/dashboard');
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>Expense Approval Review</h2>
                <button onClick={() => navigate(-1)} style={styles.backButton}>
                    ← Back to Dashboard
                </button>
            </div>

            {/* Employee Info Section */}
            <div style={styles.section}>
                <h3>Employee Information</h3>
                <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                        <strong>Name:</strong> {expenseDetail.employee.name}
                    </div>
                    <div style={styles.infoItem}>
                        <strong>Email:</strong> {expenseDetail.employee.email}
                    </div>
                    <div style={styles.infoItem}>
                        <strong>Department:</strong> {expenseDetail.employee.department}
                    </div>
                    <div style={styles.infoItem}>
                        <strong>Submitted:</strong> {expenseDetail.submittedDate}
                    </div>
                </div>
            </div>

            {/* Summary Section */}
            <div style={styles.section}>
                <h3>Expense Summary</h3>
                <div style={styles.summaryBox}>
                    <div style={styles.summaryItem}>
                        <span>Total Amount (Submitted):</span>
                        <strong>{expenseDetail.totalAmount} {expenseDetail.currency}</strong>
                    </div>
                    <div style={styles.summaryItem}>
                        <span>Converted Amount (Company Currency):</span>
                        <strong>{expenseDetail.convertedAmount} {expenseDetail.companyCurrency}</strong>
                    </div>
                    <div style={styles.summaryItem}>
                        <span>Status:</span>
                        <strong style={{ color: '#ff9800' }}>{expenseDetail.status}</strong>
                    </div>
                </div>
            </div>

            {/* Expense Items Table */}
            <div style={styles.section}>
                <h3>Expense Items Breakdown</h3>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Category</th>
                            <th style={styles.th}>Description</th>
                            <th style={styles.th}>Amount</th>
                            <th style={styles.th}>Currency</th>
                            <th style={styles.th}>Receipt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenseDetail.items.map(item => (
                            <tr key={item.id} style={styles.tr}>
                                <td style={styles.td}>{item.date}</td>
                                <td style={styles.td}>{item.category}</td>
                                <td style={styles.td}>{item.description}</td>
                                <td style={styles.td}>{item.amount}</td>
                                <td style={styles.td}>{item.currency}</td>
                                <td style={styles.td}>
                                    {item.receipt ? (
                                        <a href="#" style={styles.link}>View</a>
                                    ) : (
                                        <span style={{ color: '#999' }}>No receipt</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="3" style={{ ...styles.td, textAlign: 'right', fontWeight: 'bold' }}>
                                Total:
                            </td>
                            <td style={{ ...styles.td, fontWeight: 'bold' }}>
                                {expenseDetail.totalAmount}
                            </td>
                            <td style={styles.td}>{expenseDetail.currency}</td>
                            <td style={styles.td}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Action Section */}
            <div style={styles.section}>
                <h3>Manager Action</h3>
                <div style={styles.actionBox}>
                    <label style={styles.label}>
                        Comment {action === 'reject' && <span style={{ color: 'red' }}>*</span>}:
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add your comments here (required for rejection)..."
                        style={styles.textarea}
                    />

                    <div style={styles.buttonContainer}>
                        <button onClick={handleReject} style={styles.rejectButton}>
                            Reject
                        </button>
                        <button onClick={handleApprove} style={styles.approveButton}>
                            Approve
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
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
    backButton: {
        padding: '8px 16px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    section: {
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '15px',
    },
    infoItem: {
        padding: '10px',
        backgroundColor: 'white',
        borderRadius: '4px',
    },
    summaryBox: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '4px',
    },
    summaryItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid #eee',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
    },
    th: {
        backgroundColor: '#333',
        color: 'white',
        padding: '12px',
        textAlign: 'left',
    },
    tr: {
        borderBottom: '1px solid #ddd',
    },
    td: {
        padding: '12px',
    },
    link: {
        color: '#007bff',
        textDecoration: 'none',
    },
    actionBox: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '4px',
    },
    label: {
        display: 'block',
        marginBottom: '10px',
        fontWeight: 'bold',
    },
    textarea: {
        width: '100%',
        minHeight: '100px',
        padding: '10px',
        fontSize: '14px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        marginBottom: '20px',
    },
    buttonContainer: {
        display: 'flex',
        gap: '15px',
        justifyContent: 'flex-end',
    },
    rejectButton: {
        padding: '12px 30px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    approveButton: {
        padding: '12px 30px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
    },
};

export default ManagerApprovalDetail;