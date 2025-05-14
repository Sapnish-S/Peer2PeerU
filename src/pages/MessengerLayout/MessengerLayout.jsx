import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './MessengerLayout.css';

const MessengerLayout = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [studentId, setStudentId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const sid = localStorage.getItem('studentId');
    setStudentId(sid);
  }, []);

  useEffect(() => {
    if (!studentId) return;

    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${API_BASE}/conversations/${studentId}`);
        setConversations(res.data);
      } catch (err) {
        console.error('Failed to load conversations', err);
      }
    };

    const timeout = setTimeout(fetchConversations, 100);
    return () => clearTimeout(timeout);
  }, [studentId, API_BASE]);

  const openChat = (itemId, otherUserId) => {
    navigate(`/messages/${itemId}?to=${otherUserId}`);
  };

  const getActiveKey = () => {
    const params = new URLSearchParams(location.search);
    const itemId = location.pathname.split("/").pop();
    const toId = params.get("to");
    return `${itemId}-${toId}`;
  };

  return (
    <div className="messenger-layout">
      <div className="sidebar">
        <h3>Chats</h3>
        {conversations.map(conv => {
          const key = `${conv.itemId}-${conv.otherUserId}`;
          return (
            <div
              key={key}
              className={`conversation ${getActiveKey() === key ? 'active' : ''}`}
              onClick={() => openChat(conv.itemId, conv.otherUserId)}
            >
              <p className="user-name">{conv.otherUserName}</p>
              <p className="item-title">{conv.itemTitle}</p>
            </div>
          );
        })}
      </div>
      <div className="chat-content">
        {children}
      </div>
    </div>
  );
};

export default MessengerLayout;
