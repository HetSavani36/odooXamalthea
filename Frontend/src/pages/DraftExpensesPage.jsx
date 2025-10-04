// Frontend/src/pages/DraftExpensesPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DraftExpensesPage = () => {
    const navigate = useNavigate();

    // Mock data - FUTURE: Fetch from API
    const [drafts, setDrafts] = useState([
        {
            id: 1,
            createdDate: '2025-10-01',
            lastModified: '2025-10-02',
            totalAmount: 1250.50,
            currency: 'INR',
            itemCount: 3,
            description: 'September travel expenses',
        },
        {
            id: 2,
            createdDate: '2025-09-28',
            lastModified: '2025-09-28',
            totalAmount: 450.00,
            currency: 'USD',
            itemCount: 1,
            description: 'Software subscription',
        },
    ]);

    const handleEdit = (draftId) => {
        // FUTURE: Navigate to expense submission page with draft data
        navigate(`/employee/submit-expense?draftId=${draftId}`);
    };

    const handleDelete = (draftId) => {
        if (window.confirm('Are you sure you want to delete this draft?')) {
            setDrafts(drafts.filter(draft => draft.id !== draftId));
            // FUTURE: DELETE /api/expenses/drafts/:id
            alert('Draft deleted!');
        }
    };

    const handleSubmit = (draftId) => {
        if (window.confirm('Submit this draft for approval?')) {
            // FUTURE: POST /api/expenses/drafts/:id/submit
            setDrafts(drafts.filter(draft => draft.id !== draftId));
            alert('Draft submitted for approval!');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>My Draft Expenses</h2>
                <button onClick={() => navigate('/employee/submit-expense')} style={styles.newButton}>
                    + Create New Expense
                </button>
            </div>

            {drafts.length === 0 ? (
                <div style={styles.emptyState}>
                    <p style={styles.emptyIcon}>📝</p>
                    <h3>No Draft Expenses</h3>
                    <p>You don't have any saved drafts. Create a new expense report to get started.</p>
                    <button onClick={() => navigate('/employee/submit-expense')} style={styles.createButton}>
                        Create New Expense
                    </button>
                </div>
            ) : (
                <div style={styles.cardsContainer}>
                    {drafts.map(draft => (
                        <div key={draft.id} style={styles.draftCard}>
                            <div style={styles.cardHeader}>
                                <h3 style={styles.cardTitle}>Draft #{draft.id}</h3>
                                <span style={styles.badge}>{draft.itemCount} items</span>
                            </div>

                            <div style={styles.cardBody}>
                                <div style={styles.infoRow}>
                                    <span style={styles.label}>Description:</span>
                                    <span>{draft.description}</span>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.label}>Total Amount:</span>
                                    <strong>{draft.totalAmount} {draft.currency}</strong>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.label}>Created:</span>
                                    <span>{draft.createdDate}</span>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.label}>Last Modified:</span>
                                    <span>{draft.lastModified}</span>
                                </div>
                            </div>

                            <div style={styles.cardFooter}>
                                <button 
                                    onClick={() => handleEdit(draft.id)} 
                                    style={styles.editButton}
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleSubmit(draft.id)} 
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