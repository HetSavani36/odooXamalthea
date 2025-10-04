// Frontend/src/pages/AdminApprovalConfig.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock data for expense categories
const expenseCategories = [
    { id: 1, name: 'Travel', description: 'Travel and transportation expenses' },
    { id: 2, name: 'Meals', description: 'Food and dining expenses' },
    { id: 3, name: 'Office Supplies', description: 'Office equipment and supplies' },
    { id: 4, name: 'Accommodation', description: 'Hotel and lodging expenses' },
    { id: 5, name: 'Entertainment', description: 'Client entertainment and events' },
    { id: 6, name: 'Training', description: 'Professional development and courses' },
    { id: 7, name: 'Miscellaneous', description: 'Other business expenses' },
    { id: 8, name: 'Software', description: 'Software licenses and subscriptions' },
];

// Mock data for approvers (managers/users who can approve)
const mockApprovers = [
    { id: 1, name: 'Satish', role: 'Manager' },
    { id: 2, name: 'Ashish', role: 'Manager' },
    { id: 3, name: 'Michael', role: 'Manager' },
    { id: 4, name: 'Sarah', role: 'Manager' },
    { id: 5, name: 'John', role: 'Senior Manager' },
    { id: 6, name: 'Mitchell', role: 'Manager' },
];

const AdminApprovalConfig = () => {
    const navigate = useNavigate();
    const [ruleCategory, setRuleCategory] = useState('');
    const [ruleDescription, setRuleDescription] = useState('');
    const [amountThreshold, setAmountThreshold] = useState('');
    const [selectedApprover, setSelectedApprover] = useState('');
    const [approvers, setApprovers] = useState([]);
    const [isSequential, setIsSequential] = useState(false);
    const [requireManagerApproval, setRequireManagerApproval] = useState(false);
    const [minApprovalPercentage, setMinApprovalPercentage] = useState('');
    const [savedRules, setSavedRules] = useState([]);
    
    useEffect(() => {
        const rulesData = localStorage.getItem('approvalRules');
        if (rulesData) setSavedRules(JSON.parse(rulesData));
    }, []);
    
    // Auto-populate description when category is selected
    useEffect(() => {
        if (ruleCategory) {
            const category = expenseCategories.find(c => c.name === ruleCategory);
            if (category && !ruleDescription) {
                setRuleDescription(`Approval rule for ${category.name} expenses`);
            }
        }
    }, [ruleCategory]);

    const addApprover = () => {
        if (selectedApprover && !approvers.find(a => a.name === selectedApprover)) {
            setApprovers([...approvers, { id: Date.now(), name: selectedApprover, required: false }]);
            setSelectedApprover('');
        }
    };

    const removeApprover = (id) => setApprovers(approvers.filter(a => a.id !== id));
    const toggleRequired = (id) => setApprovers(approvers.map(a => a.id === id ? { ...a, required: !a.required } : a));

    const saveRule = (e) => {
        e.preventDefault();
        const newRule = {
            id: Date.now(),
            category: ruleCategory,
            description: ruleDescription,
            amountThreshold: amountThreshold ? parseFloat(amountThreshold) : null,
            approvers,
            isSequential,
            requireManagerApproval,
            minApprovalPercentage: minApprovalPercentage ? parseInt(minApprovalPercentage) : null,
        };
        const updatedRules = [...savedRules, newRule];
        localStorage.setItem('approvalRules', JSON.stringify(updatedRules));
        alert(`Approval rule for "${ruleCategory}" expenses saved!`);
        
        // Reset form
        setRuleCategory('');
        setRuleDescription('');
        setAmountThreshold('');
        setApprovers([]);
        setIsSequential(false);
        setRequireManagerApproval(false);
        setMinApprovalPercentage('');
    };
    
    const deleteRule = (id) => {
        if (confirm('Delete this rule?')) {
            const updatedRules = savedRules.filter(r => r.id !== id);
            localStorage.setItem('approvalRules', JSON.stringify(updatedRules));
            setSavedRules(updatedRules);
        }
    };

    return (
        <div style={s.container}>
            {/* Header Section */}
            <div style={s.header}>
                <div>
                    <h1 style={s.pageTitle}>Approval Rules Configuration (Category-Based)</h1>
                    <p style={s.pageSubtitle}>Define approval workflows for different expense categories</p>
                </div>
                <button onClick={() => navigate('/admin/dashboard')} style={s.backBtn}>
                    ← Back to Dashboard
                </button>
            </div>

            {/* Create New Rule Card */}
            <div style={s.card}>
                <div style={s.cardHeader}>
                    <h2 style={s.cardTitle}>Create New Approval Rule</h2>
                    <p style={s.cardSubtitle}>Configure approval workflow for a specific expense category</p>
                </div>
                
                <form onSubmit={saveRule}>
                    <div style={s.formGrid}>
                        {/* Left Column - Category Information */}
                        <div style={s.section}>
                            <h3 style={s.sectionTitle}>Category Information</h3>
                            
                            <div style={s.formGroup}>
                                <label style={s.label}>Expense Category <span style={s.required}>*</span></label>
                                <select 
                                    value={ruleCategory} 
                                    onChange={e => setRuleCategory(e.target.value)} 
                                    required 
                                    style={s.input}
                                >
                                    <option value="">-- Select Category --</option>
                                    {expenseCategories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name} - {cat.description}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div style={s.formGroup}>
                                <label style={s.label}>Description <span style={s.required}>*</span></label>
                                <textarea 
                                    value={ruleDescription} 
                                    onChange={e => setRuleDescription(e.target.value)} 
                                    required 
                                    style={s.textarea}
                                    placeholder="e.g., Approval rule for Travel expenses over $5000"
                                    rows="3"
                                />
                            </div>
                            
                            <div style={s.formGroup}>
                                <label style={s.label}>Amount Threshold (Optional)</label>
                                <input 
                                    type="number"
                                    value={amountThreshold} 
                                    onChange={e => setAmountThreshold(e.target.value)} 
                                    style={s.input} 
                                    placeholder="e.g., 5000"
                                    min="0"
                                    step="0.01"
                                />
                                <small style={s.hint}>Leave empty for all amounts, or set minimum amount requiring approval</small>
                            </div>
                        </div>

                        {/* Right Column - Approvers Configuration */}
                        <div style={s.section}>
                            <h3 style={s.sectionTitle}>Approvers Configuration</h3>
                            
                            <div style={s.formGroup}>
                                <div style={s.checkboxRow}>
                                    <label style={s.checkboxLabel}>
                                        <input 
                                            type="checkbox" 
                                            checked={requireManagerApproval} 
                                            onChange={e => setRequireManagerApproval(e.target.checked)}
                                            style={s.checkbox}
                                        />
                                        <span>Require employee's manager approval first</span>
                                    </label>
                                </div>
                                {requireManagerApproval && (
                                    <div style={s.infoBox}>
                                        ℹ️ Request will go to employee's manager first, then to configured approvers
                                    </div>
                                )}
                            </div>

                            <div style={s.formGroup}>
                                <label style={s.label}>Add Approvers</label>
                                <div style={s.approverInput}>
                                    <select 
                                        value={selectedApprover} 
                                        onChange={e => setSelectedApprover(e.target.value)} 
                                        style={s.select}
                                    >
                                        <option value="">-- Select approver --</option>
                                        {mockApprovers.map(u => <option key={u.id} value={u.name}>{u.name} ({u.role})</option>)}
                                    </select>
                                    <button type="button" onClick={addApprover} style={s.addBtn}>
                                        + Add
                                    </button>
                                </div>
                            </div>

                            <div style={s.approverList}>
                                <table style={s.approverTable}>
                                    <thead>
                                        <tr>
                                            <th style={s.th}>#</th>
                                            <th style={s.th}>Approver</th>
                                            <th style={s.th}>Required</th>
                                            <th style={s.th}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {approvers.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" style={s.emptyState}>
                                                    No approvers added yet. Add approvers from the dropdown above.
                                                </td>
                                            </tr>
                                        ) : (
                                            approvers.map((a, i) => (
                                                <tr key={a.id} style={s.tr}>
                                                    <td style={s.td}>{i + 1}</td>
                                                    <td style={s.td}><strong>{a.name}</strong></td>
                                                    <td style={s.td}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={a.required} 
                                                            onChange={() => toggleRequired(a.id)}
                                                            style={s.checkbox}
                                                        />
                                                    </td>
                                                    <td style={s.td}>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removeApprover(a.id)} 
                                                            style={s.removeBtn}
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                                <small style={s.hint}>✓ Required approvers must approve for request to proceed</small>
                            </div>

                            <div style={s.workflowSettings}>
                                <div style={s.formGroup}>
                                    <label style={s.checkboxLabel}>
                                        <input 
                                            type="checkbox" 
                                            checked={isSequential} 
                                            onChange={e => setIsSequential(e.target.checked)}
                                            style={s.checkbox}
                                        />
                                        <span>Sequential Approval</span>
                                    </label>
                                    <small style={s.hint}>
                                        {isSequential 
                                            ? '✓ Approvers review in order. Next approver gets request only after previous approval.'
                                            : '○ All approvers receive request simultaneously.'}
                                    </small>
                                </div>

                                <div style={s.formGroup}>
                                    <label style={s.label}>Minimum Approval Percentage</label>
                                    <div style={s.percentageInput}>
                                        <input 
                                            type="number" 
                                            value={minApprovalPercentage} 
                                            onChange={e => setMinApprovalPercentage(e.target.value)} 
                                            min="0" 
                                            max="100" 
                                            style={s.percentInput}
                                            placeholder="0"
                                        />
                                        <span style={s.percentSign}>%</span>
                                    </div>
                                    <small style={s.hint}>Percentage of approvers that must approve (e.g., 66% means 2 out of 3)</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={s.formFooter}>
                        <button type="button" onClick={() => {
                            setRuleCategory('');
                            setRuleDescription('');
                            setAmountThreshold('');
                            setApprovers([]);
                            setIsSequential(false);
                            setRequireManagerApproval(false);
                            setMinApprovalPercentage('');
                        }} style={s.cancelBtn}>
                            Clear Form
                        </button>
                        <button type="submit" style={s.saveBtn}>
                            💾 Save Approval Rule
                        </button>
                    </div>
                </form>
            </div>

            {/* Saved Rules Section */}
            {savedRules.length > 0 && (
                <div style={s.card}>
                    <div style={s.cardHeader}>
                        <h2 style={s.cardTitle}>Saved Approval Rules ({savedRules.length})</h2>
                        <p style={s.cardSubtitle}>Manage existing approval workflows</p>
                    </div>
                    
                    <div style={s.rulesGrid}>
                        {savedRules.map(r => (
                            <div key={r.id} style={s.ruleCard}>
                                <div style={s.ruleHeader}>
                                    <div>
                                        <h4 style={s.ruleUser}>{r.category}</h4>
                                        <p style={s.ruleDesc}>{r.description}</p>
                                    </div>
                                    <button onClick={() => deleteRule(r.id)} style={s.deleteBtn}>
                                        🗑️ Delete
                                    </button>
                                </div>
                                <div style={s.ruleDetails}>
                                    <div style={s.detailItem}>
                                        <span style={s.detailLabel}>Amount Threshold:</span>
                                        <span style={s.detailValue}>{r.amountThreshold ? `≥ $${r.amountThreshold.toLocaleString()}` : 'All amounts'}</span>
                                    </div>
                                    <div style={s.detailItem}>
                                        <span style={s.detailLabel}>Approvers:</span>
                                        <span style={s.detailValue}>
                                            {r.approvers.map(a => `${a.name}${a.required ? '*' : ''}`).join(', ')}
                                        </span>
                                    </div>
                                    <div style={s.ruleTags}>
                                        {r.requireManagerApproval && <span style={s.tag}>👤 Manager First</span>}
                                        {r.isSequential && <span style={s.tag}>🔄 Sequential</span>}
                                        {r.minApprovalPercentage && <span style={s.tag}>📊 {r.minApprovalPercentage}% min</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const s = {
    container: { 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '30px 20px', 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backgroundColor: '#f5f7fa',
        minHeight: '100vh',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px 0',
    },
    pageTitle: {
        margin: '0',
        fontSize: '32px',
        fontWeight: '700',
        color: '#1a202c',
        letterSpacing: '-0.5px',
    },
    pageSubtitle: {
        margin: '8px 0 0 0',
        fontSize: '15px',
        color: '#718096',
        fontWeight: '400',
    },
    backBtn: {
        padding: '10px 20px',
        background: '#fff',
        color: '#4a5568',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    card: {
        background: '#fff',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
    },
    cardHeader: {
        marginBottom: '25px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e2e8f0',
    },
    cardTitle: {
        margin: '0',
        fontSize: '22px',
        fontWeight: '600',
        color: '#2d3748',
    },
    cardSubtitle: {
        margin: '6px 0 0 0',
        fontSize: '14px',
        color: '#718096',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        marginBottom: '30px',
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    sectionTitle: {
        margin: '0 0 10px 0',
        fontSize: '13px',
        fontWeight: '600',
        color: '#2d3748',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#4a5568',
        marginBottom: '4px',
    },
    required: {
        color: '#e53e3e',
        marginLeft: '2px',
    },
    input: {
        padding: '12px 14px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        outline: 'none',
        fontFamily: 'inherit',
    },
    textarea: {
        padding: '12px 14px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        width: '100%',
        boxSizing: 'border-box',
        resize: 'vertical',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    select: {
        padding: '12px 14px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        flex: 1,
        outline: 'none',
        cursor: 'pointer',
        backgroundColor: '#fff',
    },
    hint: {
        fontSize: '12px',
        color: '#a0aec0',
        marginTop: '4px',
        lineHeight: '1.4',
    },
    checkboxRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#4a5568',
        fontWeight: '500',
    },
    checkbox: {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
        accentColor: '#3182ce',
    },
    infoBox: {
        padding: '12px 16px',
        backgroundColor: '#ebf8ff',
        border: '1px solid #bee3f8',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#2c5282',
        marginTop: '8px',
    },
    approverInput: {
        display: 'flex',
        gap: '12px',
    },
    addBtn: {
        padding: '12px 24px',
        background: '#3182ce',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 4px 12px rgba(49, 130, 206, 0.3)',
    },
    approverList: {
        marginTop: '10px',
    },
    approverTable: {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    th: {
        backgroundColor: '#f7fafc',
        padding: '12px 16px',
        textAlign: 'left',
        fontSize: '13px',
        fontWeight: '600',
        color: '#4a5568',
        borderBottom: '2px solid #e2e8f0',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    tr: {
        transition: 'background-color 0.2s',
    },
    td: {
        padding: '14px 16px',
        fontSize: '14px',
        color: '#2d3748',
        borderBottom: '1px solid #e2e8f0',
    },
    emptyState: {
        textAlign: 'center',
        padding: '40px 20px',
        color: '#a0aec0',
        fontStyle: 'italic',
        fontSize: '14px',
    },
    removeBtn: {
        padding: '6px 14px',
        background: '#fff',
        color: '#e53e3e',
        border: '1px solid #fc8181',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        transition: 'all 0.2s',
    },
    workflowSettings: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
        backgroundColor: '#f7fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
    },
    percentageInput: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    percentInput: {
        width: '100px',
        padding: '12px 14px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
    },
    percentSign: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#4a5568',
    },
    formFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        paddingTop: '25px',
        borderTop: '2px solid #e2e8f0',
    },
    cancelBtn: {
        padding: '12px 28px',
        background: '#fff',
        color: '#4a5568',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '600',
        transition: 'all 0.2s',
    },
    saveBtn: {
        padding: '12px 32px',
        background: '#3182ce',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '600',
        transition: 'all 0.2s',
        boxShadow: '0 4px 14px rgba(49, 130, 206, 0.4)',
    },
    rulesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px',
    },
    ruleCard: {
        padding: '20px',
        border: '2px solid #e2e8f0',
        borderRadius: '10px',
        backgroundColor: '#fff',
        transition: 'all 0.3s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    ruleHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #e2e8f0',
    },
    ruleUser: {
        margin: '0 0 6px 0',
        fontSize: '18px',
        fontWeight: '700',
        color: '#2d3748',
    },
    ruleDesc: {
        margin: '0',
        fontSize: '13px',
        color: '#718096',
        lineHeight: '1.4',
    },
    deleteBtn: {
        padding: '8px 16px',
        background: '#fff5f5',
        color: '#e53e3e',
        border: '1px solid #fc8181',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        transition: 'all 0.2s',
    },
    ruleDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    detailItem: {
        display: 'flex',
        gap: '8px',
        fontSize: '13px',
    },
    detailLabel: {
        fontWeight: '600',
        color: '#4a5568',
        minWidth: '80px',
    },
    detailValue: {
        color: '#2d3748',
        flex: 1,
    },
    ruleTags: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '12px',
    },
    tag: {
        display: 'inline-block',
        padding: '6px 12px',
        backgroundColor: '#edf2f7',
        color: '#4a5568',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        border: '1px solid #cbd5e0',
    },
};

export default AdminApprovalConfig;
