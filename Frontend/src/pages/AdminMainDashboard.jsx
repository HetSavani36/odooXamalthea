// Frontend/src/pages/AdminMainDashboard.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminMainDashboard = () => {
    const navigate = useNavigate();

    const menuOptions = [
        {
            title: 'User Management',
            description: 'Manage employees, assign roles & managers',
            icon: '👥',
            path: '/admin/users',
            color: '#007bff',
        },
        {
            title: 'Approval Configuration',
            description: 'Set up pre-defined approval rules',
            icon: '⚙️',
            path: '/admin/approval-config',
            color: '#28a745',
        },
        {
            title: 'Register New Admin',
            description: 'Add new admin users to the system',
            icon: '➕',
            path: '/admin/register',
            color: '#ffc107',
        },
        {
            title: 'Reports & Analytics',
            description: 'View expense reports and statistics',
            icon: '📊',
            path: '/admin/reports',
            color: '#17a2b8',
        },
        {
            title: 'System Settings',
            description: 'Configure system-wide settings',
            icon: '🔧',
            path: '/admin/settings',
            color: '#6c757d',
        },
    ];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Admin Control Room</h1>
                <p>Manage your expense management system</p>
            </div>

            <div style={styles.gridContainer}>
                {menuOptions.map((option, index) => (
                    <div
                        key={index}
                        style={{ ...styles.card, borderLeft: `5px solid ${option.color}` }}
                        onClick={() => navigate(option.path)}
                    >
                        <div style={styles.icon}>{option.icon}</div>
                        <h3 style={styles.cardTitle}>{option.title}</h3>
                        <p style={styles.cardDescription}>{option.description}</p>
                        <button style={{ ...styles.button, backgroundColor: option.color }}>
                            Open →
                        </button>
                    </div>
                ))}
            </div>

            <div style={styles.quickStats}>
                <h3>Quick Stats</h3>
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>127</div>
                        <div style={styles.statLabel}>Total Users</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>45</div>
                        <div style={styles.statLabel}>Pending Approvals</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>$24,580</div>
                        <div style={styles.statLabel}>This Month Expenses</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>8</div>
                        <div style={styles.statLabel}>Active Rules</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '30px',
        fontFamily: 'Arial, sans-serif',
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px',
        borderBottom: '3px solid #333',
        paddingBottom: '20px',
    },
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '25px',
        marginBottom: '40px',
    },
    card: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        ':hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
        },
    },
    icon: {
        fontSize: '48px',
        marginBottom: '15px',
    },
    cardTitle: {
        fontSize: '20px',
        marginBottom: '10px',
        color: '#333',
    },
    cardDescription: {
        color: '#666',
        marginBottom: '20px',
        fontSize: '14px',
        lineHeight: '1.5',
    },
    button: {
        padding: '10px 20px',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        width: '100%',
    },
    quickStats: {
        backgroundColor: '#f9f9f9',
        padding: '30px',
        borderRadius: '10px',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginTop: '20px',
    },
    statCard: {
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    statNumber: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#007bff',
        marginBottom: '10px',
    },
    statLabel: {
        color: '#666',
        fontSize: '14px',
    },
};

export default AdminMainDashboard;