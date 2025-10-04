// Frontend/src/pages/AdminUserManagement.jsx
import React, { useState } from 'react';

// Mock Data for the Users table
const mockUsers = [
    { id: 1, name: 'Alice Johnson', email: 'alice@corp.com', role: 'Manager', manager: 'N/A' },
    { id: 2, name: 'Bob Smith', email: 'bob@corp.com', role: 'Employee', manager: 'Alice Johnson' },
    { id: 3, name: 'Charlie Dean', email: 'charlie@corp.com', role: 'Employee', manager: 'Alice Johnson' },
    { id: 4, name: 'Dana Lee', email: 'dana@corp.com', role: 'Admin', manager: 'N/A' },
];

const mockManagers = ['Alice Johnson', 'Dana Lee']; 

const AdminUserManagement = () => {
    const [users, setUsers] = useState(mockUsers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ 
        name: '', email: '', role: 'Employee', manager: 'N/A' 
    });

    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({ ...user });
        setIsModalOpen(true);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = (e) => {
        e.preventDefault();
        
        // FUTURE: Send data to backend: POST/PUT to /api/admin/users
        console.log('Saving User Data (MOCK):', formData);

        // MOCK Update Logic
        if (editingUser) {
            setUsers(users.map(u => u.id === formData.id ? { ...u, ...formData } : u));
        } else {
            const newUser = { ...formData, id: users.length + 1 };
            setUsers([...users, newUser]);
        }
        
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleDelete = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter(u => u.id !== userId));
            // FUTURE: DELETE /api/admin/users/:id
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'Admin': return '#dc3545';
            case 'Manager': return '#007bff';
            case 'Employee': return '#28a745';
            default: return '#6c757d';
        }
    };

    return (
        <div style={styles.container}>
            {/* Header Section */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>User Management</h2>
                    <p style={styles.subtitle}>Manage employees, assign roles & managers</p>
                </div>
                <button 
                    style={styles.addButton} 
                    onClick={() => { 
                        setEditingUser(null); 
                        setFormData({ name: '', email: '', role: 'Employee', manager: 'N/A' }); 
                        setIsModalOpen(true); 
                    }}
                >
                    + Create New User
                </button>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsContainer}>
                <div style={styles.statCard}>
                    <div style={styles.statNumber}>{users.length}</div>
                    <div style={styles.statLabel}>Total Users</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statNumber}>{users.filter(u => u.role === 'Admin').length}</div>
                    <div style={styles.statLabel}>Admins</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statNumber}>{users.filter(u => u.role === 'Manager').length}</div>
                    <div style={styles.statLabel}>Managers</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statNumber}>{users.filter(u => u.role === 'Employee').length}</div>
                    <div style={styles.statLabel}>Employees</div>
                </div>
            </div>

            {/* Users Table */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Role</th>
                            <th style={styles.th}>Manager</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={styles.tr}>
                                <td style={styles.td}>{user.id}</td>
                                <td style={styles.td}>{user.name}</td>
                                <td style={styles.td}>{user.email}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.roleBadge,
                                        backgroundColor: getRoleBadgeColor(user.role)
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={styles.td}>{user.manager}</td>
                                <td style={styles.td}>
                                    <button 
                                        style={styles.editButton} 
                                        onClick={() => openEditModal(user)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        style={styles.deleteButton} 
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal for Creating/Editing Users */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>
                                {editingUser ? 'Edit User' : 'Create New User'}
                            </h3>
                            <button 
                                style={styles.closeButton}
                                onClick={() => setIsModalOpen(false)}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Name</label>
                                <input 
                                    style={styles.input} 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleFormChange} 
                                    placeholder="Enter full name"
                                    required 
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email</label>
                                <input 
                                    style={styles.input} 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleFormChange} 
                                    placeholder="user@company.com"
                                    required 
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Role</label>
                                <select 
                                    style={styles.input} 
                                    name="role" 
                                    value={formData.role} 
                                    onChange={handleFormChange}
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Employee">Employee</option>
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Assign Manager</label>
                                <select 
                                    style={styles.input} 
                                    name="manager" 
                                    value={formData.manager} 
                                    onChange={handleFormChange} 
                                    disabled={formData.role === 'Admin'}
                                >
                                    <option value="N/A">N/A (No Manager)</option>
                                    {mockManagers.map(manager => (
                                        <option key={manager} value={manager}>{manager}</option>
                                    ))}
                                </select>
                                {formData.role === 'Admin' && (
                                    <p style={styles.hint}>Admins don't require a manager</p>
                                )}
                            </div>

                            <div style={styles.modalFooter}>
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)} 
                                    style={styles.cancelButton}
                                >
                                    Cancel
                                </button>
                                <button type="submit" style={styles.saveButton}>
                                    {editingUser ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '30px 20px',
        fontFamily: 'Arial, sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid #333',
        paddingBottom: '20px',
    },
    title: {
        margin: '0 0 5px 0',
        fontSize: '28px',
        color: '#333',
    },
    subtitle: {
        margin: 0,
        color: '#666',
        fontSize: '14px',
    },
    addButton: {
        padding: '12px 24px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '600',
    },
    statsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
    },
    statCard: {
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center',
    },
    statNumber: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#007bff',
        marginBottom: '8px',
    },
    statLabel: {
        color: '#666',
        fontSize: '14px',
        fontWeight: '500',
    },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        backgroundColor: '#333',
        color: 'white',
        padding: '15px',
        textAlign: 'left',
        fontSize: '14px',
        fontWeight: '600',
    },
    tr: {
        borderBottom: '1px solid #e0e0e0',
        transition: 'background-color 0.2s',
    },
    td: {
        padding: '15px',
        fontSize: '14px',
        color: '#333',
    },
    roleBadge: {
        padding: '4px 12px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block',
    },
    editButton: {
        padding: '6px 14px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '13px',
        marginRight: '8px',
    },
    deleteButton: {
        padding: '6px 14px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '13px',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '550px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '25px 30px',
        borderBottom: '1px solid #e0e0e0',
    },
    modalTitle: {
        margin: 0,
        fontSize: '22px',
        color: '#333',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        color: '#666',
        cursor: 'pointer',
        padding: '0',
        width: '30px',
        height: '30px',
    },
    formGroup: {
        marginBottom: '20px',
        padding: '0 30px',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        color: '#333',
        fontSize: '14px',
        fontWeight: '600',
    },
    input: {
        width: '100%',
        padding: '12px',
        fontSize: '14px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxSizing: 'border-box',
    },
    hint: {
        fontSize: '12px',
        color: '#999',
        marginTop: '4px',
        fontStyle: 'italic',
    },
    modalFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        padding: '20px 30px',
        borderTop: '1px solid #e0e0e0',
        marginTop: '10px',
    },
    cancelButton: {
        padding: '10px 20px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    saveButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
};

export default AdminUserManagement;