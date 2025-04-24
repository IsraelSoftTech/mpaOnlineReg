import React from 'react';
import { useNavigate } from 'react-router-dom';
import './User.css';

const User = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="user-dashboard">
      <nav className="dashboard-nav">
        <div className="logo">MPASAT</div>
        <div className="nav-right">
          <span>Welcome, {user?.username}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>
      <main className="dashboard-content">
        <h1>Welcome to Your Dashboard</h1>
        <p>You have successfully logged in!</p>
      </main>
    </div>
  );
};

export default User; 