// Frontend/src/pages/ManagerApprovalDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { convertCurrency, formatCurrency, getCompanyCurrency } from '../utils/currencyConverter';
import { processApproval, checkAutoApproval, getNextApprover, areAllApprovalsComplete } from '../utils/approvalRuleEngine';

const ManagerApprovalDetail = () => {
    const { expenseId } = useParams();
    const navigate = useNavigate();
    const companyCurrency = getCompanyCurrency();
    const [currentApprover] = useState('Manager'); // In real app, get from logged-in user

    // Load expense from localStorage or use mock data
    const loadExpenseData = () => {
        // Try to load from manager's waiting approval list
        const managerWaiting = JSON.parse(localStorage.getItem('managerWaitingApproval')) || [];
        const foundExpense = managerWaiting.find(exp => exp.id == expenseId);
        
        if (foundExpense) {
            const expenseCurrency = foundExpense.currency || 'INR';
            const expenseAmount = parseFloat(foundExpense.amount) || 0;
            const convertedAmt = convertCurrency(expenseAmount, expenseCurrency, companyCurrency);
            
            // If found, structure it for display
            return {
                id: foundExpense.id,
                employee: {
                    name: foundExpense.employee || foundExpense.paidBy || 'Unknown',
                    email: 'employee@company.com',
                    department: 'N/A',
                },
                submittedDate: foundExpense.date || new Date().toISOString().split('T')[0],
                totalAmount: expenseAmount,
                currency: expenseCurrency,
                convertedAmount: convertedAmt,
                companyCurrency: companyCurrency,
                status: foundExpense.status || 'Pending Approval',
                items: [
                    {
                        id: 1,
                        date: foundExpense.date || new Date().toISOString().split('T')[0],
                        category: foundExpense.category || 'Other',
                        description: foundExpense.description || 'No description',
                        amount: expenseAmount,
                        currency: expenseCurrency,
                        convertedAmount: convertedAmt,
                        receipt: foundExpense.receipt || null,
                    }
                ],
            };
        }
        
        // Fallback to mock data if not found
        const mockCurrency = 'INR';
        const mockAmount = 1420.50;
        const mockConvertedAmount = convertCurrency(mockAmount, mockCurrency, companyCurrency);
        
        return {
            id: expenseId || 1,
            employee: {
                name: 'Alice Johnson',
                email: 'alice.j@company.com',
                department: 'Engineering',
            },
            submittedDate: '2025-10-01',
            totalAmount: mockAmount,
            currency: mockCurrency,
            convertedAmount: mockConvertedAmount,
            companyCurrency: companyCurrency,
            status: 'Pending Approval',
            items: [
                {
                    id: 1,
                    date: '2025-09-28',
                    category: 'Meals',
                    description: 'Team lunch with clients',
                    amount: 500,
                    currency: mockCurrency,
                    convertedAmount: convertCurrency(500, mockCurrency, companyCurrency),
                    receipt: 'receipt1.pdf',
                },
                {
                    id: 2,
                    date: '2025-09-29',
                    category: 'Travel',
                    description: 'Cab to airport',
                    amount: 420.50,
                    currency: mockCurrency,
                    convertedAmount: convertCurrency(420.50, mockCurrency, companyCurrency),
                    receipt: 'receipt2.pdf',
                },
                {
                    id: 3,
                    date: '2025-09-30',
                    category: 'Office Supplies',
                    description: 'Notebooks and pens',
                    amount: 500,
                    currency: mockCurrency,
                    convertedAmount: convertCurrency(500, mockCurrency, companyCurrency),
                    receipt: null,
                },
            ],
        };
    };

    const [expenseDetail, setExpenseDetail] = useState(loadExpenseData());

    // Track status and rejection reason for each item
    const [itemStatuses, setItemStatuses] = useState({});

    // Initialize item statuses when expense detail loads
    useEffect(() => {
        const initialStatuses = expenseDetail.items.reduce((acc, item) => {
            acc[item.id] = { status: 'pending', reason: '' };
            return acc;
        }, {});
        setItemStatuses(initialStatuses);
    }, [expenseDetail]);

    const handleApproveItem = (itemId) => {
        setItemStatuses(prev => ({
            ...prev,
            [itemId]: { status: 'approved', reason: '' }
        }));
        // FUTURE: POST /api/expenses/items/:itemId/approve
        console.log('Approving item:', itemId);
    };

    const handleRejectClick = (itemId) => {
        // Just mark as rejected to show the reason field
        setItemStatuses(prev => ({
            ...prev,
            [itemId]: { status: 'rejected', reason: '' }
        }));
    };

    const handleReasonChange = (itemId, reason) => {
        setItemStatuses(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], reason }
        }));
    };

    const handleSubmitDecisions = () => {
        // Check if all items have been reviewed
        const allReviewed = Object.values(itemStatuses).every(
            item => item.status !== 'pending'
        );
        
        if (!allReviewed) {
            alert('Please review all expense items before submitting');
            return;
        }

        // Check if rejected items have reasons
        const rejectedWithoutReason = Object.entries(itemStatuses).find(
            ([id, item]) => item.status === 'rejected' && !item.reason.trim()
        );

        if (rejectedWithoutReason) {
            alert('Please provide a reason for all rejected items');
            return;
        }

        // Determine overall expense status based on item statuses
        const hasRejected = Object.values(itemStatuses).some(item => item.status === 'rejected');
        const allApproved = Object.values(itemStatuses).every(item => item.status === 'approved');
        const action = hasRejected ? 'reject' : allApproved ? 'approve' : 'review';
        
        // Get rejection comments if rejected
        const rejectionComments = Object.entries(itemStatuses)
            .filter(([id, item]) => item.status === 'rejected')
            .map(([id, item]) => item.reason)
            .join('; ');

        // Move expense from Waiting Approval to Reviewed in manager's localStorage
        const waitingApproval = JSON.parse(localStorage.getItem('managerWaitingApproval')) || [];
        const reviewed = JSON.parse(localStorage.getItem('managerReviewed')) || [];
        
        // Find the current expense in waiting approval
        const expenseIndex = waitingApproval.findIndex(exp => exp.id == expenseId);
        
        if (expenseIndex !== -1) {
            // Remove from waiting approval
            const [reviewedExpense] = waitingApproval.splice(expenseIndex, 1);
            
            // Process approval using rule engine
            const updatedExpense = processApproval(
                reviewedExpense,
                currentApprover,
                action,
                rejectionComments || 'Items reviewed'
            );
            
            // Check for auto-approval
            const rule = reviewedExpense.approvalWorkflow?.rule;
            if (rule && action === 'approve') {
                const autoApproval = checkAutoApproval(rule, updatedExpense.approvalHistory);
                
                if (autoApproval.isAutoApproved) {
                    console.log('🎉 AUTO-APPROVED:', autoApproval.reason);
                    alert(`✅ AUTO-APPROVED!\n${autoApproval.reason}`);
                    updatedExpense.status = 'approved';
                    updatedExpense.autoApprovalReason = autoApproval.reason;
                } else {
                    // Check if all approvals are complete
                    if (areAllApprovalsComplete(rule, updatedExpense.approvalHistory)) {
                        console.log('✅ All required approvals complete');
                        updatedExpense.status = 'approved';
                        alert('✅ All approvals complete! Expense approved.');
                    } else {
                        // Get next approver
                        const nextApprover = getNextApprover(
                            rule, 
                            updatedExpense.approvalHistory,
                            reviewedExpense.employee
                        );
                        
                        if (nextApprover) {
                            console.log('⏭️ Next approver:', nextApprover.name);
                            updatedExpense.currentApprover = nextApprover.name;
                            updatedExpense.status = 'pending';
                            alert(`Approved! Next approver: ${nextApprover.name}`);
                        }
                    }
                }
            }
            
            // Update status
            updatedExpense.reviewedDate = new Date().toISOString().split('T')[0];
            updatedExpense.itemStatuses = itemStatuses;
            
            // Add to reviewed list
            reviewed.push(updatedExpense);
            
            // Save back to localStorage
            localStorage.setItem('managerWaitingApproval', JSON.stringify(waitingApproval));
            localStorage.setItem('managerReviewed', JSON.stringify(reviewed));
            
            console.log('📋 Approval processed:', updatedExpense);
        }

        // Update employee's expense status
        const employeeExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
        const employeeExpenseIndex = employeeExpenses.findIndex(exp => exp.id == expenseId);
        
        if (employeeExpenseIndex !== -1) {
            // Process approval for employee's copy
            const employeeExpense = processApproval(
                employeeExpenses[employeeExpenseIndex],
                currentApprover,
                action,
                rejectionComments || 'Items reviewed'
            );
            
            // Check for auto-approval
            const rule = employeeExpense.approvalWorkflow?.rule;
            if (rule && action === 'approve') {
                const autoApproval = checkAutoApproval(rule, employeeExpense.approvalHistory);
                if (autoApproval.isAutoApproved) {
                    employeeExpense.status = 'approved';
                    employeeExpense.autoApprovalReason = autoApproval.reason;
                } else if (areAllApprovalsComplete(rule, employeeExpense.approvalHistory)) {
                    employeeExpense.status = 'approved';
                }
            }
            
            employeeExpense.reviewedDate = new Date().toISOString().split('T')[0];
            employeeExpense.itemStatuses = itemStatuses;
            
            // Save back to employee's expenses
            employeeExpenses[employeeExpenseIndex] = employeeExpense;
            localStorage.setItem('expenses', JSON.stringify(employeeExpenses));
        }

        // FUTURE: POST /api/expenses/:id/submit-review with itemStatuses
        console.log('Submitting decisions:', itemStatuses);
        
        // Show success message
        alert('Review submitted successfully!');
        
        // Navigate back to manager dashboard
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
                        <span>Total Amount (Original):</span>
                        <strong>{formatCurrency(expenseDetail.totalAmount, expenseDetail.currency)}</strong>
                    </div>
                    {expenseDetail.currency !== companyCurrency && (
                        <div style={styles.summaryItem}>
                            <span>Converted to Company Currency ({companyCurrency}):</span>
                            <strong style={{ color: '#007bff' }}>
                                {formatCurrency(expenseDetail.convertedAmount, companyCurrency)}
                            </strong>
                        </div>
                    )}
                    <div style={styles.summaryItem}>
                        <span>Status:</span>
                        <strong style={{ color: '#ff9800' }}>{expenseDetail.status}</strong>
                    </div>
                </div>
            </div>

            {/* Approval Workflow Section */}
            {expenseDetail.approvalWorkflow && expenseDetail.approvalWorkflow.hasRule && (
                <div style={styles.section}>
                    <h3>📋 Approval Workflow</h3>
                    <div style={styles.workflowBox}>
                        <div style={styles.workflowInfo}>
                            <strong>Workflow Type:</strong> {expenseDetail.approvalWorkflow.isSequential ? '🔄 Sequential' : '⚡ Parallel'}
                        </div>
                        <div style={styles.workflowInfo}>
                            <strong>Required Approvers:</strong> {expenseDetail.approvalWorkflow.approvers.length}
                        </div>
                        
                        {/* Approvers List */}
                        <div style={styles.approversList}>
                            <h4 style={{ margin: '10px 0', fontSize: '14px' }}>Approval Chain:</h4>
                            {expenseDetail.approvalWorkflow.approvers.map((approver, index) => {
                                const hasApproved = expenseDetail.approvalHistory?.some(
                                    h => h.approver === approver.name && h.status === 'approved'
                                );
                                
                                return (
                                    <div key={index} style={{
                                        ...styles.approverItem,
                                        backgroundColor: hasApproved ? '#d4edda' : '#fff3cd'
                                    }}>
                                        <span style={styles.approverOrder}>{approver.order}</span>
                                        <span style={styles.approverName}>
                                            {approver.name} ({approver.role})
                                            {approver.required && <span style={{ color: '#dc3545', marginLeft: '5px' }}>*</span>}
                                        </span>
                                        <span style={styles.approverStatus}>
                                            {hasApproved ? '✅ Approved' : '⏳ Pending'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Auto-Approval Conditions */}
                        {expenseDetail.approvalWorkflow.rule && (
                            <div style={styles.autoApprovalRules}>
                                <h4 style={{ margin: '10px 0', fontSize: '14px', color: '#28a745' }}>
                                    🎯 Auto-Approval Conditions:
                                </h4>
                                {expenseDetail.approvalWorkflow.rule.minApprovalPercentage && (
                                    <div style={styles.ruleItem}>
                                        📊 {expenseDetail.approvalWorkflow.rule.minApprovalPercentage}% of approvers approve
                                    </div>
                                )}
                                {expenseDetail.approvalWorkflow.rule.approvers.some(a => a.required) && (
                                    <div style={styles.ruleItem}>
                                        ⭐ Required approver: {expenseDetail.approvalWorkflow.rule.approvers.find(a => a.required)?.name}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Approval History */}
                        {expenseDetail.approvalHistory && expenseDetail.approvalHistory.length > 0 && (
                            <div style={styles.approvalHistory}>
                                <h4 style={{ margin: '10px 0', fontSize: '14px' }}>📜 Approval History:</h4>
                                {expenseDetail.approvalHistory.map((record, index) => (
                                    <div key={index} style={styles.historyItem}>
                                        <span style={{ fontWeight: 'bold' }}>{record.approver}</span>
                                        <span style={{ 
                                            color: record.status === 'approved' ? '#28a745' : '#dc3545',
                                            fontWeight: 'bold'
                                        }}>
                                            {record.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                                        </span>
                                        <span style={{ fontSize: '12px', color: '#666' }}>
                                            {new Date(record.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Expense Items Table */}
            <div style={styles.section}>
                <h3>Expense Items Review</h3>
                <div style={styles.itemsContainer}>
                    {expenseDetail.items.map(item => (
                        <div key={item.id} style={styles.itemCard}>
                            <div style={styles.itemHeader}>
                                <h4 style={styles.itemTitle}>{item.category}</h4>
                                <span style={{
                                    ...styles.statusBadge,
                                    backgroundColor: 
                                        itemStatuses[item.id]?.status === 'approved' ? '#28a745' :
                                        itemStatuses[item.id]?.status === 'rejected' ? '#dc3545' :
                                        '#ffc107'
                                }}>
                                    {itemStatuses[item.id]?.status === 'approved' ? 'Approved' :
                                     itemStatuses[item.id]?.status === 'rejected' ? 'Rejected' :
                                     'Pending Review'}
                                </span>
                            </div>
                            
                            <div style={styles.itemDetails}>
                                <div style={styles.itemRow}>
                                    <strong>Date:</strong> {item.date}
                                </div>
                                <div style={styles.itemRow}>
                                    <strong>Description:</strong> {item.description}
                                </div>
                                <div style={styles.itemRow}>
                                    <strong>Amount (Original):</strong> {formatCurrency(item.amount, item.currency)}
                                </div>
                                {item.currency !== companyCurrency && (
                                    <div style={styles.itemRow}>
                                        <strong>Amount ({companyCurrency}):</strong> 
                                        <span style={{ color: '#007bff', marginLeft: '5px' }}>
                                            {formatCurrency(item.convertedAmount, companyCurrency)}
                                        </span>
                                    </div>
                                )}
                                <div style={styles.itemRow}>
                                    <strong>Receipt:</strong> {item.receipt ? (
                                        <a href="#" style={styles.link}>View Receipt</a>
                                    ) : (
                                        <span style={{ color: '#999' }}>No receipt</span>
                                    )}
                                </div>
                            </div>

                            {/* Rejection Reason Field - Only show when item is rejected */}
                            {itemStatuses[item.id]?.status === 'rejected' && (
                                <div style={styles.reasonSection}>
                                    <label style={styles.reasonLabel}>
                                        Rejection Reason <span style={{ color: 'red' }}>*</span>:
                                    </label>
                                    <textarea
                                        value={itemStatuses[item.id]?.reason || ''}
                                        onChange={(e) => handleReasonChange(item.id, e.target.value)}
                                        placeholder="Enter reason for rejection..."
                                        style={styles.reasonTextarea}
                                    />
                                </div>
                            )}

                            {/* Action Buttons - Only show for pending items */}
                            {itemStatuses[item.id]?.status === 'pending' && (
                                <div style={styles.itemActions}>
                                    <button 
                                        onClick={() => handleRejectClick(item.id)}
                                        style={styles.rejectItemButton}
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        onClick={() => handleApproveItem(item.id)}
                                        style={styles.approveItemButton}
                                    >
                                        Approve
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Total Summary */}
                <div style={styles.totalSection}>
                    <span style={styles.totalLabel}>Total Amount:</span>
                    <span style={styles.totalAmount}>
                        {expenseDetail.totalAmount} {expenseDetail.currency}
                    </span>
                </div>
            </div>

            {/* Submit Review Section */}
            <div style={styles.section}>
                <h3>Submit Final Decision</h3>
                <div style={styles.actionBox}>
                    <p style={styles.reviewSummary}>
                        Review Status: {' '}
                        <strong style={{ color: '#28a745' }}>
                            {Object.values(itemStatuses).filter(i => i.status === 'approved').length} Approved
                        </strong>
                        {', '}
                        <strong style={{ color: '#dc3545' }}>
                            {Object.values(itemStatuses).filter(i => i.status === 'rejected').length} Rejected
                        </strong>
                        {', '}
                        <strong style={{ color: '#ffc107' }}>
                            {Object.values(itemStatuses).filter(i => i.status === 'pending').length} Pending
                        </strong>
                    </p>

                    <div style={styles.buttonContainer}>
                        <button onClick={() => navigate(-1)} style={styles.cancelButton}>
                            Cancel
                        </button>
                        <button onClick={handleSubmitDecisions} style={styles.submitButton}>
                            Submit Review
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
    itemsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    itemCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #ddd',
    },
    itemHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '2px solid #f0f0f0',
    },
    itemTitle: {
        margin: 0,
        fontSize: '18px',
        color: '#333',
    },
    statusBadge: {
        padding: '4px 12px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
    },
    itemDetails: {
        marginBottom: '15px',
    },
    itemRow: {
        padding: '8px 0',
        fontSize: '14px',
        color: '#555',
    },
    reasonSection: {
        marginTop: '15px',
        marginBottom: '15px',
        padding: '15px',
        backgroundColor: '#fff5f5',
        borderRadius: '4px',
        border: '1px solid #ffcccc',
    },
    reasonLabel: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: 'bold',
        color: '#333',
        fontSize: '14px',
    },
    reasonTextarea: {
        width: '100%',
        minHeight: '80px',
        padding: '10px',
        fontSize: '14px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        resize: 'vertical',
    },
    workflowBox: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        border: '2px solid #007bff',
    },
    workflowInfo: {
        padding: '8px 0',
        fontSize: '14px',
    },
    approversList: {
        marginTop: '15px',
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '6px',
    },
    approverItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '10px',
        marginBottom: '8px',
        borderRadius: '6px',
        border: '1px solid #ddd',
    },
    approverOrder: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        backgroundColor: '#007bff',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '14px',
    },
    approverName: {
        flex: 1,
        fontWeight: '600',
        fontSize: '14px',
    },
    approverStatus: {
        fontSize: '13px',
        fontWeight: '600',
    },
    autoApprovalRules: {
        marginTop: '15px',
        padding: '15px',
        backgroundColor: '#d4edda',
        borderRadius: '6px',
        border: '1px solid #28a745',
    },
    ruleItem: {
        padding: '5px 0',
        fontSize: '13px',
        color: '#155724',
    },
    approvalHistory: {
        marginTop: '15px',
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '6px',
    },
    historyItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px',
        marginBottom: '8px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '13px',
    },
    itemActions: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
        marginTop: '15px',
    },
    approveItemButton: {
        padding: '10px 24px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    rejectItemButton: {
        padding: '10px 24px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    totalSection: {
        marginTop: '20px',
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '2px solid #333',
    },
    totalLabel: {
        fontSize: '18px',
        fontWeight: 'bold',
    },
    totalAmount: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#333',
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
    reviewSummary: {
        fontSize: '16px',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
    },
    buttonContainer: {
        display: 'flex',
        gap: '15px',
        justifyContent: 'flex-end',
    },
    cancelButton: {
        padding: '12px 30px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    submitButton: {
        padding: '12px 30px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
    },
};

export default ManagerApprovalDetail;