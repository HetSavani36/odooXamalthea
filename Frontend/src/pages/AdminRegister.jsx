// Frontend/src/pages/AdminRegister.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


// Assuming the backend will run on this URL
const API_URL = 'http://localhost:5000/api/auth/register'; 

// Simple inline styles defined outside the component for reuse
const inputStyle = { width: '100%', padding: '10px', margin: '5px 0 15px 0', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' };
const buttonStyle = { width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' };


const AdminRegister = () => {
    // 🔑 FIX: INITIALIZE THE HOOK HERE
    const navigate = useNavigate(); 
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        companyName: '',
        country: '', 
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const { email, password, firstName, lastName, companyName, country } = formData;

    const onChange = (e) => 
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('Registering Company and Admin...');

        // **FUTURE: Replace console.log with actual API call (POST to API_URL)**
        console.log('--- Sending Registration Data to Backend ---');

        // MOCK SUCCESS (Backend is skipped for now)
        setTimeout(() => {
            setMessage('Registration SUCCESS! (MOCK) Token saved. Redirecting...');
            
            // 🔑 FIX: The navigate function is now available and runs after the delay
            // Redirecting to the Admin User Management page (or wherever the next step is)
            navigate('/admin/users'); 
           
        }, 1500);

        // Uncomment the 'try-catch' block and remove the 'setTimeout' once the backend is ready
        /*
        try {
            const res = await axios.post(API_URL, formData);
            localStorage.setItem('token', res.data.token);
            setMessage('Registration successful!');
            navigate('/admin/users'); 
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed.');
            setMessage('');
        }
        */
    };

    return (
        <div style={{ padding: '20px', maxWidth: '450px', margin: '30px auto', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '2px 2px 10px rgba(0,0,0,0.1)' }}>
            <h2>🚀 Company & Admin Setup</h2>
            <p style={{ color: 'gray', marginBottom: '20px' }}>This user will be the first company administrator.</p>
            
            <form onSubmit={onSubmit}>
                {/* Company Details */}
                <input style={inputStyle} type="text" placeholder="Company Name" name="companyName" value={companyName} onChange={onChange} required />
                <input style={inputStyle} type="text" placeholder="Country (e.g., India)" name="country" value={country} onChange={onChange} required />
                <p style={{fontSize: '11px', color: '#666', marginTop: '-10px'}}>The country determines the default company currency.</p>
                
                <hr style={{ margin: '20px 0' }}/>
                
                {/* Admin User Details */}
                <input style={inputStyle} type="text" placeholder="First Name" name="firstName" value={firstName} onChange={onChange} required />
                <input style={inputStyle} type="text" placeholder="Last Name" name="lastName" value={lastName} onChange={onChange} required />
                <input style={inputStyle} type="email" placeholder="Email" name="email" value={email} onChange={onChange} required />
                <input style={inputStyle} type="password" placeholder="Password" name="password" value={password} onChange={onChange} required />
                
                <button type="submit" style={buttonStyle}>Register Admin & Company</button>
            </form>
            {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </div>
    );
};


export default AdminRegister;