// Frontend/src/pages/AdminApprovalConfig.jsx

import React, { useState } from 'react';

// Mock data for available approvers/groups
const mockApprovers = [
    { id: 'cfo', name: 'CFO (Finance)', role: 'User' },
    { id: 'fin', name: 'Finance Team', role: 'Group' },
    { id: 'dir', name: 'Director Level', role: 'Group' },
];

const AdminApprovalConfig = () => {
    const [ruleName, setRuleName] = useState('Default Threshold Rule');
    const [steps, setSteps] = useState([
        { id: 1, type: 'Manager', condition: 'Standard', selection: null, value: 0 },
    ]);

    const addStep = () => {
        setSteps([...steps, { id: Date.now(), type: 'User', condition: 'Standard', selection: null, value: 0 }]);
    };

    const updateStep = (id, field, value) => {
        setSteps(steps.map(step => 
            step.id === id ? { ...step, [field]: value } : step
        ));
    };

    const removeStep = (id) => {
        setSteps(steps.filter(step => step.id !== id));
    };

    const saveRule = (e) => {
        e.preventDefault();
        // FUTURE: Send the rule configuration to the backend API: POST /api/admin/approval-rules
        console.log('Saving Rule (MOCK):', { ruleName, steps });
        alert(`Approval rule "${ruleName}" simulated saved successfully!`);
        // Reset form or handle navigation
    };

    return (
        <div style={configStyle}>
            <h2>Approval Rule Configuration (Admin)</h2>
            <form onSubmit={saveRule}>
                <label style={labelStyle}>Rule Name:</label>
                <input type="text" value={ruleName} onChange={(e) => setRuleName(e.target.value)} required style={inputStyle}/>

                <h3>Approval Steps Sequence</h3>
                {steps.map((step, index) => (
                    <div key={step.id} style={stepBoxStyle}>
                        <h4>Step {index + 1}</h4>
                        
                        {/* Approver Type Selection */}
                        <label style={labelStyle}>Approver Type:</label>
                        <select style={inputStyle} value={step.type} onChange={(e) => updateStep(step.id, 'type', e.target.value)}>
                            <option value="Manager">Direct Manager</option>
                            <option value="User">Specific User/Role</option>
                            <option value="Group">Specific Group/Team</option>
                        </select>
                        
                        {/* Specific Approver/Group Selection */}
                        {(step.type === 'User' || step.type === 'Group') && (
                            <>
                                <label style={labelStyle}>Select Approver/Group:</label>
                                <select style={inputStyle} value={step.selection || ''} onChange={(e) => updateStep(step.id, 'selection', e.target.value)}>
                                    <option value="">-- Select --</option>
                                    {mockApprovers.filter(a => a.role === step.type).map(app => (
                                        <option key={app.id} value={app.id}>{app.name}</option>
                                    ))}
                                </select>
                            </>
                        )}
                        
                        {/* Conditional Rule */}
                        <label style={labelStyle}>Conditional Rule:</label>
                        <select style={inputStyle} value={step.condition} onChange={(e) => updateStep(step.id, 'condition', e.target.value)}>
                            <option value="Standard">Standard (All Must Approve)</option>
                            <option value="Percentage">Percentage Rule (e.g., 60% of group)</option>
                            <option value="Specific">Specific Approver Rule (e.g., CFO approval auto-approves)</option>
                            <option value="Hybrid">Hybrid (Percentage OR Specific)</option>
                        </select>

                        {/* Value Input based on Rule */}
                        {(step.condition === 'Percentage') && (
                            <>
                                <label style={labelStyle}>Percentage Threshold (e.g., 60):</label>
                                <input style={inputStyle} type="number" value={step.value} onChange={(e) => updateStep(step.id, 'value', Number(e.target.value))} />
                            </>
                        )}

                        <button type="button" onClick={() => removeStep(step.id)} style={removeButtonStyle}>Remove Step</button>
                    </div>
                ))}
                
                <button type="button" onClick={addStep} style={addButtonStyle}>+ Add Approval Step</button>
                <button type="submit" style={saveButtonStyle}>Save Approval Rule</button>
            </form>
        </div>
    );
};

// Simple CSS styles
const configStyle = { padding: '20px', maxWidth: '700px', margin: '20px auto' };
const labelStyle = { display: 'block', marginTop: '10px', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '8px', margin: '5px 0 10px 0', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' };
const stepBoxStyle = { border: '1px solid #ddd', padding: '15px', borderRadius: '4px', marginBottom: '15px' };
const addButtonStyle = { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' };
const saveButtonStyle = { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' };
const removeButtonStyle = { float: 'right', backgroundColor: 'darkred', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' };

export default AdminApprovalConfig;