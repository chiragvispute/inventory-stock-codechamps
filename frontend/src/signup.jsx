import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be 8+ chars, include upper, lower, number, and special character (@$!%*?&)');
      setLoading(false);
      return;
    }

    if (loginId.length < 3 || loginId.length > 20) {
      setError('Login ID must be 3-20 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          loginId, 
          email, 
          password, 
          firstName: firstName || loginId,
          lastName: lastName || 'User'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Signup successful - now login to get token
      const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        localStorage.setItem('token', loginData.token);
        navigate('/dashboard');
      } else {
        // Account created but login failed - redirect to login page
        alert('Account created successfully! Please log in.');
        navigate('/login');
      }
    } catch (err) {
      console.error('Signup failed:', err);
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
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
              placeholder="Choose your login ID (3-20 chars)"
              required 
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          <div>
            <label>First Name (Optional):</label>
            <input 
              type="text" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              placeholder="Your first name"
              disabled={loading}
            />
          </div>
          <div>
            <label>Last Name (Optional):</label>
            <input 
              type="text" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              placeholder="Your last name"
              disabled={loading}
            />
          </div>
          <div>
            <label>Password:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="8+ chars with upper, lower, number, special"
              required 
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
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
          <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem'}}>Existing Database Users:</p>
          <p style={{fontSize: '0.8rem', color: '#666'}}>admin / admin123 (admin role)</p>
          <p style={{fontSize: '0.8rem', color: '#666'}}>manager1 / manager123 (manager role)</p>
          <p style={{fontSize: '0.8rem', color: '#666'}}>operator1 / operator123 (operator role)</p>
          <div style={{marginTop: '1rem', padding: '0.5rem', backgroundColor: '#e3f2fd', border: '1px solid #2196f3', borderRadius: '4px'}}>
            <p style={{fontSize: '0.8rem', color: '#1976d2', fontWeight: 'bold'}}>✅ New users saved to database!</p>
            <p style={{fontSize: '0.75rem', color: '#1976d2'}}>✅ Strong password validation</p>
            <p style={{fontSize: '0.75rem', color: '#1976d2'}}>✅ Automatic login after signup</p>
            <p style={{fontSize: '0.75rem', color: '#1976d2'}}>✅ New accounts get 'operator' role</p>
          </div>
          <div style={{marginTop: '1rem', padding: '0.5rem', backgroundColor: '#fef3cd', border: '1px solid #f59e0b', borderRadius: '4px'}}>
            <p style={{fontSize: '0.8rem', color: '#92400e', fontWeight: 'bold'}}>Password Requirements:</p>
            <p style={{fontSize: '0.75rem', color: '#92400e'}}>• 8+ characters</p>
            <p style={{fontSize: '0.75rem', color: '#92400e'}}>• Upper & lower case letters</p>
            <p style={{fontSize: '0.75rem', color: '#92400e'}}>• Numbers & special chars (@$!%*?&)</p>
            <p style={{fontSize: '0.75rem', color: '#92400e', fontWeight: 'bold'}}>Examples: Password123!, Test@User1, Demo@1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;