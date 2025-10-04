// Frontend/src/pages/NewExpenseSubmission.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createApprovalWorkflow } from '../utils/approvalRuleEngine';
import { convertCurrency, getCompanyCurrency } from '../utils/currencyConverter';

const NewExpenseSubmission = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editingExpense = location.state?.expense; // Get expense data if editing
    const companyCurrency = getCompanyCurrency();
    
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [expenseData, setExpenseData] = useState({
        id: null,
        description: '',
        expenseDate: new Date().toISOString().substring(0, 10),
        category: '',
        paidBy: 'John Doe', // Default username
        manager: 'Satish', // Default manager - in real app, get from user profile
        totalAmount: '',
        currency: companyCurrency,
        remarks: '',
        receipt: null,
        status: 'draft'
    });

    const [submissionHistory, setSubmissionHistory] = useState([]);

    const categories = ['Travel', 'Meals', 'Office Supplies', 'Software', 'Entertainment', 'Other'];
    const currencies = ['USD', 'EUR', 'INR', 'GBP', 'JPY', 'AUD', 'CAD'];

    // Load expense data if editing
    useEffect(() => {
        if (editingExpense) {
            setExpenseData(editingExpense);
            if (editingExpense.status === 'pending' || editingExpense.status === 'approved') {
                setIsSubmitted(true);
                setSubmissionHistory(editingExpense.history || []);
            }
        }
    }, [editingExpense]);

    const handleInputChange = (e) => {
        if (isSubmitted) return; // Prevent editing after submission
        const { name, value } = e.target;
        setExpenseData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (e) => {
        if (isSubmitted) return; // Prevent file upload after submission
        setExpenseData(prev => ({ ...prev, receipt: e.target.files[0] }));
    };

    const handleSaveDraft = () => {
        // Save or update draft in localStorage
        const drafts = JSON.parse(localStorage.getItem('expenseDrafts') || '[]');
        
        const draftData = {
            ...expenseData,
            id: expenseData.id || Date.now(),
            status: 'draft',
            savedAt: new Date().toISOString()
        };
        
        if (expenseData.id) {
            // Update existing draft
            const index = drafts.findIndex(d => d.id === expenseData.id);
            if (index !== -1) {
                drafts[index] = draftData;
            } else {
                drafts.push(draftData);
            }
        } else {
            // New draft
            drafts.push(draftData);
        }
        
        localStorage.setItem('expenseDrafts', JSON.stringify(drafts));
        console.log('Saving as draft:', draftData);
        alert('Expense saved as draft!');
        navigate('/employee/drafts');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Convert amount to company currency if needed
        const convertedAmount = convertCurrency(
            parseFloat(expenseData.totalAmount),
            expenseData.currency,
            companyCurrency
        );
        
        // Create approval workflow based on rules
        const workflow = createApprovalWorkflow(
            {
                category: expenseData.category,
                amount: parseFloat(expenseData.totalAmount),
                convertedAmount: convertedAmount,
                currency: expenseData.currency
            },
            expenseData.paidBy,
            expenseData.manager
        );
        
        console.log('🔍 Approval Workflow:', workflow);
        
        // Save submitted expense to employee's localStorage
        const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        
        const submittedExpense = {
            ...expenseData,
            id: expenseData.id || Date.now(),
            employee: expenseData.paidBy || 'John Doe', // Employee name
            amount: expenseData.totalAmount,
            convertedAmount: convertedAmount,
            companyCurrency: companyCurrency,
            date: expenseData.expenseDate,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            approvalWorkflow: workflow,
            approvalHistory: [],
            currentApprover: workflow.approvers && workflow.approvers.length > 0 
                ? workflow.approvers[0].name 
                : null,
            history: [
                {
                    id: Date.now(),
                    approver: 'System',
                    status: workflow.requiresApproval ? 'Pending Approval' : 'Auto-Approved',
                    time: new Date().toLocaleString('en-GB', { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                    }),
                    message: workflow.message
                }
            ]
        };
        
        expenses.push(submittedExpense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        
        // If approval required, add to manager's waiting approval list
        if (workflow.requiresApproval && workflow.approvers && workflow.approvers.length > 0) {
            const managerWaitingApproval = JSON.parse(localStorage.getItem('managerWaitingApproval') || '[]');
            const managerExpense = {
                id: submittedExpense.id,
                employee: submittedExpense.employee,
                amount: submittedExpense.totalAmount,
                currency: submittedExpense.currency,
                convertedAmount: convertedAmount,
                companyCurrency: companyCurrency,
                category: submittedExpense.category,
                date: submittedExpense.expenseDate,
                status: 'Waiting Approval',
                description: submittedExpense.description,
                remarks: submittedExpense.remarks,
                paidBy: submittedExpense.paidBy,
                receipt: submittedExpense.receipt,
                approvalWorkflow: workflow,
                approvalHistory: [],
                currentApprover: workflow.approvers[0].name
            };
            managerWaitingApproval.push(managerExpense);
            localStorage.setItem('managerWaitingApproval', JSON.stringify(managerWaitingApproval));
            
            console.log('✅ Expense submitted to Manager:', managerExpense);
            console.log('📊 Manager Waiting Approval List:', managerWaitingApproval);
        }
        
        console.log('✅ Expense submitted to Employee:', submittedExpense);
        
        // Remove from drafts if it was a draft
        if (expenseData.status === 'draft') {
            const drafts = JSON.parse(localStorage.getItem('expenseDrafts') || '[]');
            const updatedDrafts = drafts.filter(d => d.id !== expenseData.id);
            localStorage.setItem('expenseDrafts', JSON.stringify(updatedDrafts));
        }
        
        console.log('Submitting expense:', submittedExpense);
        
        const approvalMessage = workflow.requiresApproval 
            ? `Expense submitted! Requires approval from: ${workflow.approvers.map(a => a.name).join(', ')}`
            : 'Expense submitted and auto-approved!';
            
        alert(approvalMessage);
        
        // Redirect to employee dashboard
        navigate('/employee/dashboard');
    };

    return (
        <div style={styles.container}>
            <div style={styles.formCard}>
                {/* Top Section - Attach Receipt Button */}
                <div style={styles.topSection}>
                    <button 
                        style={isSubmitted ? styles.attachButtonDisabled : styles.attachButton}
                        disabled={isSubmitted}
                        onClick={() => document.getElementById('receiptInput').click()}
                    >
                        Attach Receipt
                    </button>
                    <input 
                        id="receiptInput"
                        type="file" 
                        accept="image/*,.pdf" 
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                    {isSubmitted && (
                        <div style={styles.statusBadge}>
                            Status: Pending Approval
                        </div>
                    )}
                </div>

                {/* Main Form Section */}
                <form onSubmit={handleSubmit} style={styles.formSection}>
                    <div style={styles.formGrid}>
                        {/* Left Column */}
                        <div style={styles.leftColumn}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Description</label>
                                <input 
                                    type="text" 
                                    name="description" 
                                    value={expenseData.description} 
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="Enter description"
                                    disabled={isSubmitted}
                                    readOnly={isSubmitted}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Category</label>
                                <select 
                                    name="category" 
                                    value={expenseData.category} 
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    disabled={isSubmitted}
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Total amount in <span style={styles.currencyLabel}>currency selection ▼</span></label>
                                <div style={styles.amountRow}>
                                    <input 
                                        type="number" 
                                        name="totalAmount" 
                                        value={expenseData.totalAmount} 
                                        onChange={handleInputChange}
                                        style={styles.amountInput}
                                        placeholder="567"
                                        step="0.01"
                                        disabled={isSubmitted}
                                        readOnly={isSubmitted}
                                    />
                                    <select 
                                        name="currency" 
                                        value={expenseData.currency} 
                                        onChange={handleInputChange}
                                        style={styles.currencySelect}
                                        disabled={isSubmitted}
                                    >
                                        {currencies.map(curr => (
                                            <option key={curr} value={curr}>{curr}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div style={styles.rightColumn}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Expense Date</label>
                                <input 
                                    type="date" 
                                    name="expenseDate" 
                                    value={expenseData.expenseDate} 
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    max={new Date().toISOString().substring(0, 10)}
                                    disabled={isSubmitted}
                                    readOnly={isSubmitted}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Paid by:</label>
                                <input 
                                    type="text" 
                                    name="paidBy" 
                                    value={expenseData.paidBy} 
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="Enter name"
                                    disabled={isSubmitted}
                                    readOnly={isSubmitted}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Remarks</label>
                                <textarea 
                                    name="remarks" 
                                    value={expenseData.remarks} 
                                    onChange={handleInputChange}
                                    style={styles.textarea}
                                    placeholder="Enter remarks..."
                                    rows="5"
                                    disabled={isSubmitted}
                                    readOnly={isSubmitted}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submission History Table - Only show after submission */}
                    {isSubmitted && submissionHistory.length > 0 && (
                        <div style={styles.historySection}>
                            <h3 style={styles.historySectionTitle}>Approval Log History</h3>
                            <table style={styles.historyTable}>
                                <thead>
                                    <tr>
                                        <th style={styles.historyTh}>Approver</th>
                                        <th style={styles.historyTh}>Status</th>
                                        <th style={styles.historyTh}>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissionHistory.map(entry => (
                                        <tr key={entry.id}>
                                            <td style={styles.historyTd}>{entry.approver}</td>
                                            <td style={styles.historyTd}>
                                                <span style={
                                                    entry.status === 'Approved' ? styles.statusApproved :
                                                    entry.status === 'Rejected' ? styles.statusRejected :
                                                    styles.statusPending
                                                }>
                                                    {entry.status}
                                                </span>
                                            </td>
                                            <td style={styles.historyTd}>{entry.time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Submit and Draft Buttons - Only show before submission */}
                    {!isSubmitted && (
                        <div style={styles.submitSection}>
                            <button 
                                type="button" 
                                onClick={handleSaveDraft}
                                style={styles.draftButton}
                            >
                                Save as Draft
                            </button>
                            <button type="submit" style={styles.submitButton}>Submit</button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
    },
    formCard: {
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '30px',
        maxWidth: '1200px',
        margin: '0 auto',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    topSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e0e0e0',
    },
    attachButton: {
        padding: '10px 20px',
        backgroundColor: 'white',
        border: '2px solid #333',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
    },
    attachButtonDisabled: {
        padding: '10px 20px',
        backgroundColor: '#f0f0f0',
        border: '2px solid #ccc',
        borderRadius: '6px',
        cursor: 'not-allowed',
        fontSize: '14px',
        fontWeight: '600',
        color: '#999',
    },
    statusBadge: {
        padding: '10px 20px',
        backgroundColor: '#ffc107',
        color: '#333',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
    },
    formSection: {
        marginTop: '20px',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '30px',
        marginBottom: '30px',
    },
    leftColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    rightColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
    },
    input: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        width: '100%',
        boxSizing: 'border-box',
    },
    currencyLabel: {
        fontSize: '12px',
        fontWeight: 'normal',
        color: '#666',
    },
    amountRow: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
    },
    amountInput: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        flex: 1,
    },
    currencySelect: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        width: '100px',
    },
    textarea: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        width: '100%',
        boxSizing: 'border-box',
        resize: 'vertical',
        fontFamily: 'inherit',
    },
    historySection: {
        marginTop: '30px',
        marginBottom: '20px',
    },
    historySectionTitle: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#333',
    },
    historyTable: {
        width: '100%',
        borderCollapse: 'collapse',
        border: '1px solid #ddd',
    },
    historyTh: {
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #ddd',
        textAlign: 'left',
        fontSize: '13px',
        fontWeight: '600',
    },
    historyTd: {
        padding: '12px',
        borderBottom: '1px solid #eee',
        fontSize: '13px',
    },
    statusApproved: {
        color: '#28a745',
        fontWeight: '600',
    },
    statusRejected: {
        color: '#dc3545',
        fontWeight: '600',
    },
    statusPending: {
        color: '#ffc107',
        fontWeight: '600',
    },
    submitSection: {
        display: 'flex',
        justifyContent: 'flex-start',
        gap: '15px',
        marginTop: '20px',
    },
    draftButton: {
        padding: '12px 40px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
    },
    submitButton: {
        padding: '12px 40px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
    },
};

export default NewExpenseSubmission;
