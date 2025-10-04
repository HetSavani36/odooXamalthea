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
        setUsers(users.map(u => u.id === formData.id ? { ...u, ...formData } : u));
        
        setIsModalOpen(false);
        setEditingUser(null);
    };

    return (
        <div style={dashboardStyle}>
            <h2>Admin: User & Manager Management</h2>
            <button 
                style={addButton} 
                onClick={() => { setEditingUser(null); setFormData({ name: '', email: '', role: 'Employee', manager: 'N/A' }); setIsModalOpen(true); }}
            >
                + Create New User
            </button>

            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Manager</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.manager}</td>
                            <td>
                                <button style={editButton} onClick={() => openEditModal(user)}>Edit/Assign</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal for Creating/Editing Users */}
            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3>{editingUser ? 'Edit User' : 'Create New User'}</h3>
                        <form onSubmit={handleSave}>
                            {/* Simple form fields for CRUD and role assignment */}
                            <label style={labelStyle}>Name:</label>
                            <input style={inputStyle} type="text" name="name" value={formData.name} onChange={handleFormChange} required />

                            <label style={labelStyle}>Email:</label>
                            <input style={inputStyle} type="email" name="email" value={formData.email} onChange={handleFormChange} required />

                            <label style={labelStyle}>Role:</label>
                            <select style={inputStyle} name="role" value={formData.role} onChange={handleFormChange}>
                                <option value="Admin">Admin</option>
                                <option value="Manager">Manager</option>
                                <option value="Employee">Employee</option>
                            </select>

                            <label style={labelStyle}>Assign Manager:</label>
                            <select style={inputStyle} name="manager" value={formData.manager} onChange={handleFormChange} disabled={formData.role === 'Admin'}>
                                <option value="N/A">N/A</option>
                                {mockManagers.map(manager => <option key={manager} value={manager}>{manager}</option>)}
                            </select>

                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={cancelButton}>Cancel</button>
                                <button type="submit" style={saveButton}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple CSS styles
const dashboardStyle = { padding: '20px', maxWidth: '1000px', margin: '20px auto' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '15px' };
const inputStyle = { width: '100%', padding: '8px', margin: '5px 0 10px 0', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' };
const labelStyle = { display: 'block', fontWeight: 'bold', marginTop: '10px' };

const addButton = { padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' };
const editButton = { padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '500px' };
const cancelButton = { padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' };
const saveButton = { padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default AdminUserManagement;