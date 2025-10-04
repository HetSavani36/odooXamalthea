// Frontend/src/components/ExpenseForm.jsx

import React, { useState } from 'react';

const categories = ['Travel', 'Meals', 'Office Supplies', 'Software Subscription', 'Other'];

// NOTE: companyCurrency is mocked here; it would be fetched from the logged-in user's data
const ExpenseForm = ({ companyCurrency = 'USD' }) => {
    const [expenseData, setExpenseData] = useState({
        submittedAmount: '',
        submittedCurrency: companyCurrency,
        category: '',
        description: '',
        date: new Date().toISOString().substring(0, 10),
        receiptFile: null, 
    });

    const onChange = (e) => {
        const { name, value } = e.target;
        setExpenseData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setExpenseData(prev => ({ ...prev, receiptFile: e.target.files[0] }));
        // FUTURE: This is where the frontend would send the file to a backend OCR service
        console.log("Future OCR scan triggered for file:", e.target.files[0].name);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        
        // FUTURE: Replace this console log with an axios POST request to /api/expenses
        console.log('Submitting Expense (MOCK):', expenseData);
        alert(`Expense for ${expenseData.submittedAmount} ${expenseData.submittedCurrency} submitted for approval.`);
    };

    return (
        <div style={formContainerStyle}>
            <h3>Submit New Expense Claim</h3>
            <form onSubmit={onSubmit}>
                {/* OCR Feature Placeholder */}
                <div style={inputGroupStyle}>
                    <label>Upload Receipt for Auto-Fill (Future OCR)</label>
                    <input type="file" onChange={handleFileChange} accept="image/*" />
                </div>
                
                {/* Expense Details */}
                <div style={inputGroupStyle}>
                    <label>Amount</label>
                    <input style={inputStyle} type="number" name="submittedAmount" value={expenseData.submittedAmount} onChange={onChange} required />
                </div>

                <div style={inputGroupStyle}>
                    <label>Currency</label>
                    <input style={inputStyle} type="text" name="submittedCurrency" value={expenseData.submittedCurrency} onChange={onChange} required />
                    <p style={{fontSize: '10px', color: 'gray'}}>Company default: {companyCurrency}. Submit in local currency if needed.</p>
                </div>

                <div style={inputGroupStyle}>
                    <label>Date</label>
                    <input style={inputStyle} type="date" name="date" value={expenseData.date} onChange={onChange} required />
                </div>
                
                <div style={inputGroupStyle}>
                    <label>Category</label>
                    <select style={{...inputStyle, padding: '10px'}} name="category" value={expenseData.category} onChange={onChange} required>
                        <option value="">-- Select Category --</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                <div style={inputGroupStyle}>
                    <label>Description</label>
                    <textarea style={inputStyle} name="description" value={expenseData.description} onChange={onChange} required />
                </div>

                <button type="submit" style={buttonStyle}>Submit Expense Claim</button>
            </form>
        </div>
    );
};

// Simple inline styles
const formContainerStyle = { padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '600px', margin: '20px auto' };
const inputGroupStyle = { marginBottom: '15px' };
const inputStyle = { width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' };
const buttonStyle = { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default ExpenseForm;