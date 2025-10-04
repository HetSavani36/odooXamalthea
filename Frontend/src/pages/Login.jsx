// Frontend/src/pages/Login.jsx

import React from 'react';

const Login = () => {
  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>User Login</h2>
      <p style={{ color: 'gray' }}>Login functionality will be fully implemented in the final Backend phase.</p>
      
      <form>
        <input style={inputStyle} type="email" placeholder="Email" required />
        <input style={inputStyle} type="password" placeholder="Password" required />
        <button style={buttonStyle} type="submit" onClick={(e) => { e.preventDefault(); alert('Login MOCK: Submitting...'); }}>Login</button>
      </form>
    </div>
  );
};

// Simple styles
const inputStyle = { width: '100%', padding: '10px', margin: '10px 0', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' };
const buttonStyle = { width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' };


export default Login;