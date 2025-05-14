import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MessengerLayout from "../pages/MessengerLayout/MessengerLayout";
import Chatbox from "../pages/Chatbox/Chatbox";
import axios from "axios";

const MessagesPage = () => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const studentId = localStorage.getItem("studentId");
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL;
  useEffect(() => {
    axios.get(`${API_BASE}/conversations/${studentId}`)
      .then(res => {
        const conversations = res.data;
        if (conversations.length > 0) {
          const { itemId, otherUserId } = conversations[0];
          navigate(`/messages/${itemId}?to=${otherUserId}`);
        }
        setHasLoaded(true);
      })
      .catch(err => {
        console.error("Failed to load conversations:", err);
        setHasLoaded(true);
      });
  }, [studentId, navigate]);

  if (!hasLoaded) return <p>Loading messages...</p>;

  return (
    <MessengerLayout>
      <Chatbox />
    </MessengerLayout>
  );
};

export default MessagesPage;
