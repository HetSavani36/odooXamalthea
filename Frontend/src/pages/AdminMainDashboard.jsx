// Frontend/src/pages/AdminMainDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminMainDashboard = () => {
    const navigate = useNavigate();

    // Mock data - same as in AdminUserManagement and ManagerDashboard
    const [stats, setStats] = useState({
        totalUsers: 4, // Based on mockUsers in AdminUserManagement
        pendingApprovals: 2, // Based on mockWaitingApproval in ManagerDashboard
        thisMonthExpenses: 2220.50, // Sum of waiting approval expenses
        activeRules: 3, // Based on approval rules that might be configured
        admins: 1,
        managers: 1,
        employees: 2,
        approvedExpenses: 2,
        draftExpenses: 2,
    });

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

    // FUTURE: Fetch real stats from backend
    useEffect(() => {
        // This would be replaced with API calls
        // fetch('/api/admin/stats').then(...)
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Admin Control Room</h1>
                <p style={styles.subtitle}>Manage your expense management system</p>
            </div>

            {/* Quick Stats Section */}
            <div style={styles.quickStats}>
                <h3 style={styles.statsTitle}>System Overview</h3>
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>👥</div>
                        <div style={styles.statNumber}>{stats.totalUsers}</div>
                        <div style={styles.statLabel}>Total Users</div>
                        <div style={styles.statBreakdown}>
                            {stats.admins} Admin · {stats.managers} Manager · {stats.employees} Employees
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>⏳</div>
                        <div style={styles.statNumber}>{stats.pendingApprovals}</div>
                        <div style={styles.statLabel}>Pending Approvals</div>
                        <div style={styles.statBreakdown}>
                            Waiting for manager review
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>💰</div>
                        <div style={styles.statNumber}>₹{stats.thisMonthExpenses.toLocaleString()}</div>
                        <div style={styles.statLabel}>This Month Expenses</div>
                        <div style={styles.statBreakdown}>
                            {stats.approvedExpenses} approved · {stats.draftExpenses} drafts
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>⚙️</div>
                        <div style={styles.statNumber}>{stats.activeRules}</div>
                        <div style={styles.statLabel}>Active Approval Rules</div>
                        <div style={styles.statBreakdown}>
                            Pre-configured workflows
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Options */}
            <div style={styles.menuSection}>
                <h3 style={styles.menuTitle}>Quick Actions</h3>
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
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px',
        borderBottom: '3px solid #333',
        paddingBottom: '20px',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    title: {
        margin: '0 0 10px 0',
        fontSize: '32px',
        color: '#333',
    },
    subtitle: {
        margin: 0,
        color: '#666',
        fontSize: '16px',
    },
    quickStats: {
        marginBottom: '40px',
    },
    statsTitle: {
        fontSize: '22px',
        color: '#333',
        marginBottom: '20px',
        fontWeight: '600',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
    },
    statCard: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
    },
    statIcon: {
        fontSize: '40px',
        marginBottom: '15px',
    },
    statNumber: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#007bff',
        marginBottom: '8px',
    },
    statLabel: {
        color: '#333',
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '8px',
    },
    statBreakdown: {
        color: '#999',
        fontSize: '12px',
        marginTop: '5px',
        fontStyle: 'italic',
    },
    menuSection: {
        marginTop: '40px',
    },
    menuTitle: {
        fontSize: '22px',
        color: '#333',
        marginBottom: '20px',
        fontWeight: '600',
    },
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '25px',
    },
    card: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
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
};

export default AdminMainDashboard;