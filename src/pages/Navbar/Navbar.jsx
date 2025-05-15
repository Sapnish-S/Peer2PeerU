import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import axios from 'axios';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [ProfileImg, setProfileImg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();
  const studentId = localStorage.getItem("studentId");
  const API_BASE = "http://localhost:8000";


  useEffect(() => {
    if (!studentId) return;

    axios.get(`${API_BASE}/profile-image/${studentId}`, { responseType: 'arraybuffer' })
      .then(res => {
        const base64 = btoa(
          new Uint8Array(res.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        setProfileImg(`data:image/jpeg;base64,${base64}`);
      })
      .catch(() => setProfileImg(null));
  }, [studentId]);


  useEffect(() => {
    if (!studentId) return;

    axios.get(`${API_BASE}/notifications/${studentId}`)
      .then(res => {
        setNotifications(res.data);
      })
      .catch(err => console.error("Failed to load notifications:", err));
  }, [studentId]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = (id) => {
    if (!id) return;

    axios.patch(`${API_BASE}/notifications/mark-read/${id}`)
      .then(() => {
        setNotifications(prev =>
          prev.map(n =>
            n.notification_id === id ? { ...n, is_read: true } : n
          )
        );
      })
      .catch(err => console.error("Failed to mark as read:", err));
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/home"><img src="/Peer2Peer2.png" alt="Peer2PeerU Logo" className="navbar-logo-img" /></Link>
        <h1 className="navbar-logo-text">Peer2PeerU</h1>
      </div>

      <button className="hamburger-menu" onClick={toggleMenu}>
        <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
      </button>

      <div className={`navbar-right ${isMenuOpen ? 'open' : ''}`}>
        <ul className="navbar-links">
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/messages">Messages</Link></li>
          <li><Link to="/Listing">List An Item</Link></li>
          <li className="navbar-search">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-button" onClick={handleSearch}>Search</button>
          </li>

          <li className="notification-wrapper">
            <button className="bell" onClick={() => setShowDropdown(!showDropdown)}>
              🔔
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>

            {showDropdown && (
              <div className="dropdown">
                <h4>Notifications</h4>
                {notifications.length === 0 ? (
                  <p>No notifications</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.notification_id}
                      className={`notification ${n.is_read ? 'read' : ''}`}
                      onClick={() => markAsRead(n.notification_id)}
                    >
                      <p>{n.notification_text}</p>
                      <small>{new Date(n.created_at).toLocaleString()}</small>
                    </div>
                  ))
                )}
              </div>
            )}
          </li>

          <li>
            <Link to={`/profile/${studentId}`}>
              <img src={ProfileImg || "/default-avatar.png"} alt="Profile" className="profile-icon" />
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
