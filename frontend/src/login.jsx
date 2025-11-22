import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          loginId: username, 
          password: password 
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('OTP sent! Check console for development OTP.');
        console.log('Development OTP:', data.otp);
        setShowResetPassword(true);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Forgot password failed:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: resetEmail, 
          otp: otp, 
          newPassword: newPassword 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset successfully! You can now login.');
        setShowForgotPassword(false);
        setShowResetPassword(false);
        setResetEmail('');
        setOtp('');
        setNewPassword('');
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Password reset failed:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setShowForgotPassword(false);
    setShowResetPassword(false);
    setResetEmail('');
    setOtp('');
    setNewPassword('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="login-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        {!showForgotPassword ? (
          <>
            <h2 style={{textAlign: 'center', marginBottom: '1.5rem', color: '#1f2937'}}>
              Login to Your Account
            </h2>
            <form onSubmit={handleLogin} style={{marginBottom: '1rem'}}>
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500'}}>
                  Username:
                </label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Enter your login ID"
                  required 
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500'}}>
                  Password:
                </label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter your password"
                  required 
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <div style={{marginTop: '1rem', textAlign: 'center'}}>
              <button 
                onClick={() => setShowForgotPassword(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '0.9rem'
                }}
              >
                Forgot Password?
              </button>
            </div>
            
            <div style={{
              marginTop: '1.5rem', 
              textAlign: 'center', 
              borderTop: '1px solid #e5e7eb', 
              paddingTop: '1rem'
            }}>
              <p style={{color: '#6b7280', marginBottom: '0.5rem'}}>
                Don't have an account?
              </p>
              <Link 
                to="/signup" 
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                Create New Account
              </Link>
            </div>
          </>
        ) : !showResetPassword ? (
          <>
            <h2 style={{textAlign: 'center', marginBottom: '1.5rem', color: '#1f2937'}}>
              Reset Password
            </h2>
            <form onSubmit={handleForgotPassword} style={{marginBottom: '1rem'}}>
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500'}}>
                  Email Address:
                </label>
                <input 
                  type="email" 
                  value={resetEmail} 
                  onChange={(e) => setResetEmail(e.target.value)} 
                  placeholder="Enter your email address"
                  required 
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
            
            <div style={{marginTop: '1rem', textAlign: 'center'}}>
              <button 
                onClick={resetForms}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                ← Back to Login
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{textAlign: 'center', marginBottom: '1.5rem', color: '#1f2937'}}>
              Enter New Password
            </h2>
            <form onSubmit={handleResetPassword} style={{marginBottom: '1rem'}}>
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500'}}>
                  OTP (Check Console):
                </label>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  placeholder="Enter the 6-digit OTP"
                  required 
                  disabled={loading}
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500'}}>
                  New Password:
                </label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Enter your new password"
                  required 
                  disabled={loading}
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
            
            <div style={{marginTop: '1rem', textAlign: 'center'}}>
              <button 
                onClick={resetForms}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                ← Back to Login
              </button>
            </div>
          </>
        )}

        {error && (
          <div style={{
            color: '#dc2626',
            marginTop: '1rem',
            textAlign: 'center',
            padding: '0.5rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{
            color: '#059669',
            marginTop: '1rem',
            textAlign: 'center',
            padding: '0.5rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '4px'
          }}>
            {success}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
