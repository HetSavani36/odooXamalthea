// Frontend/src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
    alert('Login MOCK: Submitting...');
    navigate('/employee/dashboard');
  };

  const handleSignup = (e) => {
    e.preventDefault();
    navigate('/admin/register');
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Forgot Password functionality will be implemented soon!');
    // FUTURE: Navigate to forgot password page or show modal
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2 style={styles.title}>Signin Page</h2>
        <p style={styles.subtitle}>Enter your credentials to access your account</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input 
              style={styles.input} 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email" 
              required 
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input 
              style={styles.input} 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password" 
              required 
            />
          </div>

          <button style={styles.button} type="submit">
            Login
          </button>

          <div style={styles.footer}>
            <a href="#" onClick={handleSignup} style={styles.link}>Don't have an account? Signup</a>
            <br />
            <a href="#" onClick={handleForgotPassword} style={styles.link}>Forgot password?</a>
          </div>
        </form>
        
        
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
  loginBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '450px',
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
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#333',
    fontSize: '14px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '10px',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '14px',
    lineHeight: '2',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
  note: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    borderLeft: '4px solid #007bff',
  },
  noteText: {
    margin: 0,
    fontSize: '12px',
    color: '#666',
    lineHeight: '1.6',
  },
};

export default Login;
