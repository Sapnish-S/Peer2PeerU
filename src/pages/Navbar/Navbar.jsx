import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [ProfileImg, setProfileImg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const studentId = localStorage.getItem("studentId");
  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (studentId) {
      fetch(`${API_BASE}/profile-image/${studentId}`)
        .then(res => res.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setProfileImg(url);
        })
        .catch(() => setProfileImg(null));
    }
  }, [studentId, API_BASE]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to={`/home`}>
          <img src="/Peer2Peer2.png" alt="Peer2PeerU Logo" className="navbar-logo-img" />
        </Link>
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
