// Frontend/src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, handleAPIError } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authAPI.login(formData.email, formData.password);
      
      if (response.success) {
        const user = response.data; // User object is directly in response.data
        
        // Navigate based on role
        if (user && user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user && user.role === 'manager') {
          navigate('/manager/dashboard');
        } else if (user && user.role === 'employee') {
          navigate('/employee/dashboard');
        } else {
          // Fallback navigation
          console.log('User role:', user?.role);
          navigate('/employee/dashboard');
        }
      }
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
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
        <div style={styles.brandSection}>
          <div style={styles.logo}>💼</div>
          <h1 style={styles.brandTitle}>ExpenseFlow</h1>
          <p style={styles.brandSubtitle}>Modern Expense Management System</p>
        </div>

        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Sign in to continue to your account</p>
        
        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              style={styles.input} 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com" 
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

          <a href="#" onClick={handleForgotPassword} style={styles.forgotLink}>
            Forgot password?
          </a>

          <button 
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            type="submit"
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#5568d3';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#667eea';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.3)';
              }
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine}></div>
          </div>

          <button 
            type="button" 
            onClick={handleSignup} 
            style={styles.signupButton}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#667eea';
              e.target.style.color = 'white';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#667eea';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Create New Account
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px',
  },
  loginBox: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: 'white',
    padding: '48px',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 20px rgba(0, 0, 0, 0.05)',
  },
  brandSection: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logo: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  brandTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px',
    margin: 0,
  },
  brandSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '400',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px',
    margin: 0,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '32px',
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'center',
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
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  },
  forgotLink: {
    fontSize: '14px',
    color: '#667eea',
    textDecoration: 'none',
    alignSelf: 'flex-end',
    marginBottom: '24px',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)',
    transform: 'translateY(0)',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
    gap: '12px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: '14px',
    color: '#9ca3af',
  },
  signupButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'transparent',
    color: '#667eea',
    border: '1.5px solid #667eea',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    transform: 'translateY(0)',
  },
};

export default Login;
