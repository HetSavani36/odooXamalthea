// Frontend/src/pages/ExpenseSubmissionPage.jsx

import React, { useState } from 'react';
import { convertCurrency, formatCurrency, getCompanyCurrency, getSupportedCurrencies } from '../utils/currencyConverter';

const ExpenseSubmissionPage = () => {
    const companyCurrency = getCompanyCurrency();
    
    const [expenseData, setExpenseData] = useState({
        category: '',
        date: new Date().toISOString().substring(0, 10),
        amount: '',
        currency: companyCurrency,
        description: '',
        receipt: null,
    });

    const [expenseItems, setExpenseItems] = useState([]);

    const categories = ['Travel', 'Meals', 'Office Supplies', 'Software', 'Entertainment', 'Other'];
    const currencies = getSupportedCurrencies();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setExpenseData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (e) => {
        setExpenseData(prev => ({ ...prev, receipt: e.target.files[0] }));
    };

    const addExpenseItem = () => {
        if (expenseData.amount && expenseData.category) {
            const convertedAmount = convertCurrency(
                expenseData.amount, 
                expenseData.currency, 
                companyCurrency
            );
            
            setExpenseItems([...expenseItems, { 
                ...expenseData, 
                id: Date.now(),
                convertedAmount,
                companyCurrency
            }]);
            
            // Reset form
            setExpenseData({
                category: '',
                date: new Date().toISOString().substring(0, 10),
                amount: '',
                currency: companyCurrency,
                description: '',
                receipt: null,
            });
        }
    };

    const removeExpenseItem = (id) => {
        setExpenseItems(expenseItems.filter(item => item.id !== id));
    };

    const handleSubmit = (isDraft = false) => {
        const submitData = {
            expenses: expenseItems,
            status: isDraft ? 'draft' : 'submitted',
            submittedAt: new Date().toISOString(),
        };
        
        // FUTURE: POST to /api/expenses/submit
        console.log('Submitting expenses:', submitData);
        alert(isDraft ? 'Saved as draft!' : 'Submitted for approval!');
        setExpenseItems([]);
    };

    const calculateTotal = () => {
        return expenseItems.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>Submit Expense Report</h2>
                <p>User should be able to upload a receipt (which can be scanned later by OCR service) and claim reimbursement</p>
            </div>

            <div style={styles.formSection}>
                <h3>Add Expense Item</h3>
                
                <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                        <label>Category *</label>
                        <select 
                            name="category" 
                            value={expenseData.category} 
                            onChange={handleInputChange}
                            style={styles.input}
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label>Date *</label>
                        <input 
                            type="date" 
                            name="date" 
                            value={expenseData.date} 
                            onChange={handleInputChange}
                            style={styles.input}
                        />
                    </div>
                </div>

                <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                        <label>Amount *</label>
                        <input 
                            type="number" 
                            name="amount" 
                            value={expenseData.amount} 
                            onChange={handleInputChange}
                            placeholder="0.00"
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label>Currency *</label>
                        <select 
                            name="currency" 
                            value={expenseData.currency} 
                            onChange={handleInputChange}
                            style={styles.input}
                        >
                            {currencies.map(curr => (
                                <option key={curr} value={curr}>{curr}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={styles.formGroup}>
                    <label>Description</label>
                    <textarea 
                        name="description" 
                        value={expenseData.description} 
                        onChange={handleInputChange}
                        placeholder="Add expense details..."
                        style={{ ...styles.input, minHeight: '80px' }}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Upload Receipt</label>
                    <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        onChange={handleFileUpload}
                        style={styles.fileInput}
                    />
                </div>

                <button onClick={addExpenseItem} style={styles.addButton}>
                    Add to List
                </button>
            </div>

            {/* Expense Items Table */}
            <div style={styles.tableSection}>
                <h3>Expense Items</h3>
                {expenseItems.length === 0 ? (
                    <p style={styles.emptyMessage}>No expenses added yet. Add items above.</p>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Category</th>
                                <th style={styles.th}>Description</th>
                                <th style={styles.th}>Amount</th>
                                <th style={styles.th}>Currency</th>
                                <th style={styles.th}>Converted ({companyCurrency})</th>
                                <th style={styles.th}>Receipt</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenseItems.map(item => (
                                <tr key={item.id} style={styles.tr}>
                                    <td style={styles.td}>{item.date}</td>
                                    <td style={styles.td}>{item.category}</td>
                                    <td style={styles.td}>{item.description || '-'}</td>
                                    <td style={styles.td}>{formatCurrency(item.amount, item.currency)}</td>
                                    <td style={styles.td}>{item.currency}</td>
                                    <td style={styles.td}>
                                        {item.currency === companyCurrency 
                                            ? '-' 
                                            : formatCurrency(item.convertedAmount, companyCurrency)}
                                    </td>
                                    <td style={styles.td}>{item.receipt ? '✓' : '-'}</td>
                                    <td style={styles.td}>
                                        <button 
                                            onClick={() => removeExpenseItem(item.id)}
                                            style={styles.removeButton}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="3" style={{ ...styles.td, textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                                <td style={{ ...styles.td, fontWeight: 'bold' }}>{formatCurrency(calculateTotal(), companyCurrency)}</td>
                                <td colSpan="4" style={styles.td}></td>
                            </tr>
                        </tfoot>
                    </table>
                )}
            </div>

            {/* Submit Buttons */}
            <div style={styles.buttonContainer}>
                <button 
                    onClick={() => handleSubmit(true)} 
                    style={styles.draftButton}
                    disabled={expenseItems.length === 0}
                >
                    Save as Draft
                </button>
                <button 
                    onClick={() => handleSubmit(false)} 
                    style={styles.submitButton}
                    disabled={expenseItems.length === 0}
                >
                    Submit for Approval
                </button>
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
        marginBottom: '30px',
        borderBottom: '2px solid #333',
        paddingBottom: '10px',
    },
    formSection: {
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
    },
    formRow: {
        display: 'flex',
        gap: '20px',
        marginBottom: '15px',
    },
    formGroup: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        padding: '10px',
        fontSize: '14px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        marginTop: '5px',
    },
    fileInput: {
        marginTop: '5px',
    },
    addButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        marginTop: '10px',
    },
    tableSection: {
        marginBottom: '30px',
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
        borderBottom: '2px solid #ddd',
    },
    tr: {
        borderBottom: '1px solid #ddd',
    },
    td: {
        padding: '12px',
        textAlign: 'left',
    },
    removeButton: {
        padding: '5px 10px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#666',
        fontStyle: 'italic',
        padding: '20px',
    },
    buttonContainer: {
        display: 'flex',
        gap: '15px',
        justifyContent: 'flex-end',
    },
    draftButton: {
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
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
    },
};

export default ExpenseSubmissionPage;