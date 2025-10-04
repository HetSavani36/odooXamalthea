// Frontend/src/pages/DraftExpensesPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DraftExpensesPage = () => {
    const navigate = useNavigate();
    const [drafts, setDrafts] = useState([]);

    // Load drafts from localStorage
    useEffect(() => {
        const savedDrafts = JSON.parse(localStorage.getItem('expenseDrafts') || '[]');
        setDrafts(savedDrafts);
    }, []);

    const handleEdit = (draft) => {
        // Navigate to expense submission page with draft data
        navigate('/employee/new-expense', { state: { expense: draft } });
    };

    const handleDelete = (draftId) => {
        if (window.confirm('Are you sure you want to delete this draft?')) {
            const updatedDrafts = drafts.filter(draft => draft.id !== draftId);
            setDrafts(updatedDrafts);
            localStorage.setItem('expenseDrafts', JSON.stringify(updatedDrafts));
            alert('Draft deleted!');
        }
    };

    const handleSubmit = (draft) => {
        if (window.confirm('Submit this draft for approval?')) {
            // Move from drafts to expenses
            const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
            const submittedExpense = {
                ...draft,
                status: 'pending',
                submittedAt: new Date().toISOString(),
                history: [
                    {
                        id: Date.now(),
                        approver: 'System',
                        status: 'Pending Approval',
                        time: new Date().toLocaleString('en-GB', { 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                        })
                    }
                ]
            };
            
            expenses.push(submittedExpense);
            localStorage.setItem('expenses', JSON.stringify(expenses));
            
            // Remove from drafts
            const updatedDrafts = drafts.filter(d => d.id !== draft.id);
            setDrafts(updatedDrafts);
            localStorage.setItem('expenseDrafts', JSON.stringify(updatedDrafts));
            
            alert('Draft submitted for approval!');
            navigate('/employee/dashboard');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>My Draft Expenses</h2>
                <button onClick={() => navigate('/employee/new-expense')} style={styles.newButton}>
                    + Create New Expense
                </button>
            </div>

            {drafts.length === 0 ? (
                <div style={styles.emptyState}>
                    <p style={styles.emptyIcon}>📝</p>
                    <h3>No Draft Expenses</h3>
                    <p>You don't have any saved drafts. Create a new expense report to get started.</p>
                    <button onClick={() => navigate('/employee/new-expense')} style={styles.createButton}>
                        Create New Expense
                    </button>
                </div>
            ) : (
                <div style={styles.cardsContainer}>
                    {drafts.map(draft => (
                        <div key={draft.id} style={styles.draftCard}>
                            <div style={styles.cardHeader}>
                                <h3 style={styles.cardTitle}>Draft - {draft.description || 'No Description'}</h3>
                                <span style={styles.badge}>{draft.category || 'Uncategorized'}</span>
                            </div>

                            <div style={styles.cardBody}>
                                <div style={styles.infoRow}>
                                    <span style={styles.label}>Description:</span>
                                    <span>{draft.description || '-'}</span>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.label}>Total Amount:</span>
                                    <strong>{draft.totalAmount || '0'} {draft.currency}</strong>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.label}>Expense Date:</span>
                                    <span>{draft.expenseDate}</span>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.label}>Paid By:</span>
                                    <span>{draft.paidBy}</span>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.label}>Last Saved:</span>
                                    <span>{new Date(draft.savedAt).toLocaleString()}</span>
                                </div>
                            </div>

                            <div style={styles.cardFooter}>
                                <button 
                                    onClick={() => handleEdit(draft)} 
                                    style={styles.editButton}
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleSubmit(draft)} 
                                    style={styles.submitButton}
                                >
                                    Submit
                                </button>
                                <button 
                                    onClick={() => handleDelete(draft.id)} 
                                    style={styles.deleteButton}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
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
    newButton: {
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px',
    },
    emptyIcon: {
        fontSize: '64px',
        marginBottom: '20px',
    },
    createButton: {
        marginTop: '20px',
        padding: '12px 30px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    cardsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px',
    },
    draftCard: {
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    cardHeader: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #ddd',
    },
    cardTitle: {
        margin: 0,
        fontSize: '18px',
    },
    badge: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
    },
    cardBody: {
        padding: '15px',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        paddingBottom: '10px',
        borderBottom: '1px solid #f0f0f0',
    },
    label: {
        color: '#666',
        fontSize: '14px',
    },
    cardFooter: {
        padding: '15px',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
    },
    editButton: {
        padding: '8px 16px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    submitButton: {
        padding: '8px 16px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    deleteButton: {
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
    },
};

export default DraftExpensesPage;