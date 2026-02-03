import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../store/slices/authSlice';
import './Login.css'; // Import the CSS file

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await dispatch(login({ email, password })).unwrap();
      if (res?.token) {
        navigate('/');
      }
    } catch (err) {
      // handled in slice
    }
  };

  return (
    <div className="auth-page">
      <h2>Welcome Back</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Email
          <input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            type="email" 
            placeholder="Enter your email"
            required 
          />
        </label>
        <label>
          Password
          <input 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            type="password" 
            placeholder="Enter your password"
            required 
          />
        </label>
        <button type="submit" disabled={loading} className="btn">
          {loading ? 'Logging in' : 'Login'}
        </button>
        {error && <div className="error">{error.message || JSON.stringify(error)}</div>}
        <div className="muted">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </form>
    </div>
  );
}