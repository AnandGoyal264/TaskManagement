import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import './Header.css';
import { useState, useEffect, useRef } from 'react';
import './DarkModeButton.css';

export default function Header() {
  const { user, token } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const userProfileRef = useRef(null);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dark-mode') === 'true';
    setIsDarkMode(saved);
    if (saved) {
      document.body.classList.add('dark-mode');
    }
  }, []);

  // Close user profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userProfileRef.current && !userProfileRef.current.contains(event.target)) {
        setShowUserProfile(false);
      }
    };

    if (showUserProfile) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserProfile]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('dark-mode', newMode);
    if (newMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return '#dc2626';
      case 'manager':
        return '#f59e0b';
      case 'employee':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getFirstName = (fullName) => {
    if (!fullName) return 'U';
    const firstName = fullName.split(' ')[0];
    return firstName.charAt(0).toUpperCase();
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/">Task Platform</Link>
        <nav>
          {token ? (
            <>
              <Link to="/">Dashboard</Link>
              <Link to="/tasks">Tasks</Link>
              <Link to="/analytics">Analytics</Link>
              <button
                className="header-dark-mode-btn"
                onClick={toggleDarkMode}
                title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>

              {/* User Profile Icon */}
              <div className="user-profile-container" ref={userProfileRef}>
                <button
                  className="user-profile-btn"
                  onClick={() => setShowUserProfile(!showUserProfile)}
                  title={user?.name}
                >
                  <div
                    className="user-avatar"
                    style={{ backgroundColor: getRoleColor(user?.role) }}
                  >
                    {getFirstName(user?.name)}
                  </div>
                </button>

                {showUserProfile && (
                  <div className="user-profile-dropdown">
                    <div className="profile-header">
                      <div
                        className="profile-avatar"
                        style={{ backgroundColor: getRoleColor(user?.role) }}
                      >
                        {getFirstName(user?.name)}
                      </div>
                      <div className="profile-info">
                        <div className="profile-name">{user?.name || 'User'}</div>
                        <div className="profile-email">{user?.email || 'No email'}</div>
                      </div>
                    </div>
                    <div className="profile-divider"></div>
                    <div className="profile-role">
                      <span className="role-label">Role:</span>
                      <span className="role-badge" style={{ backgroundColor: getRoleColor(user?.role) }}>
                        {(user?.role || 'user')?.charAt(0).toUpperCase() + (user?.role || 'user')?.slice(1)}
                      </span>
                    </div>
                    <div className="profile-divider"></div>
                    <button
                      className="profile-logout-btn"
                      onClick={() => {
                        dispatch(logout());
                        setShowUserProfile(false);
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}