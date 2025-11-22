import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, email, password })
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const data = await response.json();
      const token = data.token;
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup failed:', err);
      setError('Signup failed: ' + err.message);
    }
  };

  return (
    <div className="login-container">
      <div>
        <h2>Create New Account</h2>
        <form onSubmit={handleSignup}>
          <div>
            <label>Login ID:</label>
            <input 
              type="text" 
              value={loginId} 
              onChange={(e) => setLoginId(e.target.value)} 
              placeholder="Choose your login ID"
              required 
            />
          </div>
          <div>
            <label>Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              required 
            />
          </div>
          <div>
            <label>Password:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter password (min. 6 chars)"
              required 
            />
          </div>
          <div>
            <label>Confirm Password:</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="Confirm password"
              required 
            />
          </div>
          <button type="submit">Sign Up</button>
        </form>

        <div style={{marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #e5e7eb', padding: '0.2rem'}}>
          <p style={{color: '#6b7280', marginBottom: '0.4rem'}}>Already have an account?</p>
          <Link 
            to="/login" 
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
          >
            Sign In
          </Link>
        </div>

        {error && <p style={{color: 'red', marginTop: '1rem', textAlign: 'center'}}>{error}</p>}

        <div style={{marginTop: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px'}}>
          <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem'}}>Demo Credentials:</p>
          <p style={{fontSize: '0.8rem', color: '#666'}}>Login ID: testuser, Password: testpass</p>
          <p style={{fontSize: '0.8rem', color: '#666'}}>Login ID: manager, Password: manager123</p>
          <div style={{marginTop: '1rem', padding: '0.5rem', backgroundColor: '#fef3cd', border: '1px solid #f59e0b', borderRadius: '4px'}}>
            <p style={{fontSize: '0.8rem', color: '#92400e', fontWeight: 'bold'}}>For Signup - Valid Password Examples:</p>
            <p style={{fontSize: '0.75rem', color: '#92400e'}}>Password123!</p>
            <p style={{fontSize: '0.75rem', color: '#92400e'}}>MyPass@2024</p>
            <p style={{fontSize: '0.75rem', color: '#92400e'}}>Test@User1</p>
            <p style={{fontSize: '0.75rem', color: '#92400e'}}>Demo@1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;