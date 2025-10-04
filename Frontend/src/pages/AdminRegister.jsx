// Frontend/src/pages/AdminRegister.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


// Assuming the backend will run on this URL
const API_URL = 'http://localhost:5000/api/auth/register'; 

const AdminRegister = () => {
    const navigate = useNavigate(); 
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        country: '', 
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // List of countries
    const countries = [
        'United States',
        'United Kingdom',
        'Canada',
        'Australia',
        'India',
        'Germany',
        'France',
        'Japan',
        'China',
        'Brazil',
        'Mexico',
        'Spain',
        'Italy',
        'Netherlands',
        'Sweden',
        'Switzerland',
        'Singapore',
        'United Arab Emirates',
        'Saudi Arabia',
        'South Africa',
        'New Zealand',
        'Ireland',
        'Belgium',
        'Austria',
        'Denmark',
        'Norway',
        'Finland',
        'Poland',
        'Portugal',
        'Greece',
        'Other'
    ];

    const { email, password, confirmPassword, companyName, country } = formData;

    const onChange = (e) => 
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validate password match
        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        setMessage('Registering Company and Admin...');

        // **FUTURE: Replace console.log with actual API call (POST to API_URL)**
        console.log('--- Sending Registration Data to Backend ---');

        // MOCK SUCCESS (Backend is skipped for now)
        setTimeout(() => {
            setMessage('Registration SUCCESS! (MOCK) Token saved. Redirecting to Admin Dashboard...');
            
            // Navigate to Admin Dashboard (Control Room) as per wireframe
            navigate('/admin/dashboard'); 
           
        }, 1500);

        // Uncomment the 'try-catch' block and remove the 'setTimeout' once the backend is ready
        /*
        try {
            const res = await axios.post(API_URL, formData);
            localStorage.setItem('token', res.data.token);
            setMessage('Registration successful!');
            navigate('/admin/dashboard'); 
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed.');
            setMessage('');
        }
        */
    };

    return (
        <div style={styles.container}>
            <div style={styles.formBox}>
                <h2 style={styles.title}>Admin Registration</h2>
                <p style={styles.subtitle}>Set up your company and create the first administrator account</p>
                
                <form onSubmit={onSubmit}>
                    {/* Company Details */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Company Information</h3>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Company Name</label>
                            <input 
                                style={styles.input} 
                                type="text" 
                                placeholder="Enter company name" 
                                name="companyName" 
                                value={companyName} 
                                onChange={onChange} 
                                required 
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Country</label>
                            <select 
                                style={styles.input} 
                                name="country" 
                                value={country} 
                                onChange={onChange} 
                                required
                            >
                                <option value="">Select a country</option>
                                {countries.map((countryName, index) => (
                                    <option key={index} value={countryName}>
                                        {countryName}
                                    </option>
                                ))}
                            </select>
                            <p style={styles.hint}>The country determines the default company currency</p>
                        </div>
                    </div>
                    
                    <hr style={styles.divider}/>
                    
                    {/* Admin User Details */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Administrator Account</h3>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email</label>
                            <input 
                                style={styles.input} 
                                type="email" 
                                placeholder="admin@company.com" 
                                name="email" 
                                value={email} 
                                onChange={onChange} 
                                required 
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Password</label>
                            <input 
                                style={styles.input} 
                                type="password" 
                                placeholder="Create a strong password" 
                                name="password" 
                                value={password} 
                                onChange={onChange} 
                                required 
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Confirm Password</label>
                            <input 
                                style={styles.input} 
                                type="password" 
                                placeholder="Re-enter your password" 
                                name="confirmPassword" 
                                value={confirmPassword} 
                                onChange={onChange} 
                                required 
                            />
                        </div>
                    </div>
                    
                    <button type="submit" style={styles.button}>
                        Register Admin & Company
                    </button>
                </form>
                
                {message && <p style={styles.successMessage}>{message}</p>}
                {error && <p style={styles.errorMessage}>{error}</p>}
                
                <div style={styles.footer}>
                    <a href="/login" style={styles.link}>Already have an account? Login here</a>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
    },
    formBox: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '600px',
    },
    title: {
        margin: '0 0 10px 0',
        fontSize: '28px',
        color: '#333',
        textAlign: 'center',
    },
    subtitle: {
        color: '#666',
        textAlign: 'center',
        marginBottom: '30px',
        fontSize: '14px',
        lineHeight: '1.5',
    },
    section: {
        marginBottom: '20px',
    },
    sectionTitle: {
        fontSize: '18px',
        color: '#333',
        marginBottom: '15px',
        fontWeight: '600',
    },
    formRow: {
        display: 'flex',
        gap: '15px',
    },
    formGroup: {
        marginBottom: '15px',
        flex: 1,
    },
    label: {
        display: 'block',
        marginBottom: '6px',
        color: '#333',
        fontSize: '14px',
        fontWeight: '500',
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
    divider: {
        border: 'none',
        borderTop: '1px solid #e0e0e0',
        margin: '25px 0',
    },
    button: {
        width: '100%',
        padding: '14px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        marginTop: '10px',
    },
    successMessage: {
        color: '#28a745',
        marginTop: '15px',
        textAlign: 'center',
        fontWeight: '500',
    },
    errorMessage: {
        color: '#dc3545',
        marginTop: '15px',
        textAlign: 'center',
        fontWeight: '500',
    },
    footer: {
        marginTop: '20px',
        textAlign: 'center',
        fontSize: '14px',
    },
    link: {
        color: '#007bff',
        textDecoration: 'none',
    },
};

export default AdminRegister;