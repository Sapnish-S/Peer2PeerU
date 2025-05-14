import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL;

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post(`${API_BASE}/`, {
      email: email,
      password: password
    })
    .then((response) => {
      console.log('Login Success', response.data);
      localStorage.setItem("studentId", response.data.student_id); 
      alert('Login Successful ✅');
      navigate("/home");
    })
    .catch(error => {
      console.error('Login Failed', error);
      alert('Login Failed ❌');
    });
  };

  return (
    <div className="login-page-container">
      <div className="login-image-section">
        <div className="logo">
          <img src="/Peer2Peer2.png" alt="logo" className="logo-img" />
        </div>
        <img src="/coverweb.png" alt="Buy and Sell" className="login-image" />
      </div>

      <div className="login-card">
        <h1 className="login-heading">Login</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email" className="login-label">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            className="login-input"
            placeholder="Enter your university email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password" className="login-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="login-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-button">
            Submit
          </button>

          <p className="login-text">
            <Link to="/register" className="register-link">
              Don't have an account? Register
            </Link>
          </p>
          <p className="forgot-password">Forgot Password?</p>
        </form>
      </div>
    </div>
  );
};

export default Login;
