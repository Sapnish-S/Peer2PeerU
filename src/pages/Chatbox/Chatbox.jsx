import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Chatbox.css';

const Chatbox = () => {
  const { itemId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const rawReceiverId = new URLSearchParams(location.search).get('to');
  const receiverId = rawReceiverId && !isNaN(rawReceiverId) ? parseInt(rawReceiverId) : null;
  const senderId = parseInt(localStorage.getItem("studentId"));

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [item, setItem] = useState(null);
  const [receiverName, setReceiverName] = useState('');
  const [senderName, setSenderName] = useState('');
  const ws = useRef(null);
  const chatEndRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_URL;
  const WS_BASE = API_BASE.replace('https', 'wss');

  useEffect(() => {
    if (!receiverId || isNaN(receiverId)) {
      navigate("/home");
    }
  }, [receiverId, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemRes, senderRes, receiverRes] = await Promise.all([
          axios.get(`${API_BASE}/item/${itemId}`),
          axios.get(`${API_BASE}/user/${senderId}`),
          axios.get(`${API_BASE}/user/${receiverId}`),
        ]);
        setItem(itemRes.data);
        setSenderName(`${senderRes.data.firstName} ${senderRes.data.lastName}`);
        setReceiverName(`${receiverRes.data.firstName} ${receiverRes.data.lastName}`);
      } catch (err) {
        console.error("Failed to load item or user info:", err);
      }
    };

    if (itemId && senderId && receiverId) fetchData();
  }, [API_BASE, itemId, senderId, receiverId]);

  useEffect(() => {
    if (itemId && senderId && receiverId) {
      axios
        .get(`${API_BASE}/messages/item/${itemId}?user1=${senderId}&user2=${receiverId}`)
        .then(res => setMessages(res.data))
        .catch(err => console.error("Failed to load messages:", err));
    }
  }, [API_BASE, itemId, senderId, receiverId]);

  useEffect(() => {
    if (!itemId || !senderId || !receiverId) return;

    const socket = new WebSocket(`${WS_BASE}/ws/${itemId}/${senderId}`);
    ws.current = socket;

    socket.onopen = () => console.log("WebSocket connected");
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages(prev => [...prev, msg]);
    };
    socket.onerror = (err) => console.error("WebSocket error:", err);
    socket.onclose = () => console.warn("WebSocket closed");

    return () => socket.close();
  }, [WS_BASE, itemId, senderId, receiverId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !receiverId || !ws.current) return;

    const messageObj = {
      content: newMessage.trim(),
      receiver_id: receiverId
    };

    try {
      ws.current.send(JSON.stringify(messageObj));
      setNewMessage('');
    } catch (err) {
      console.error("WebSocket send failed:", err);
    }
  };

  return (
    <div className="chat-container">
      <h2 className="chat-header">
        {item && `${item.title} • Chat with ${receiverName}`}
      </h2>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={msg.message_id || index}
            className={`chat-bubble ${msg.sender_id === senderId ? 'sent' : 'received'}`}
          >
            <p className="chat-name">
              {msg.sender_id === senderId ? "You" : receiverName}
            </p>
            <p>{msg.content}</p>
            <span className="chat-timestamp">
              {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
            </span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chatbox;
