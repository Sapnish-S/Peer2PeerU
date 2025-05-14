import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ItemDetails.css';

const ItemDetails = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const API_BASE = import.meta.env.VITE_API_URL;
  const buyerName = localStorage.getItem("name") || "a potential buyer";

  useEffect(() => {
    axios.get(`${API_BASE}/item/${itemId}`)
      .then(res => setItem(res.data))
      .catch(err => console.error("Failed to fetch item", err));
  }, [itemId, API_BASE]);

  const handleMessageClick = () => {
    navigate(`/messages/${item.itemId}?to=${item.sellerId}`);
  };

  const handleSellerReviewClick = () => {
    navigate(`/seller-review/${item.sellerId}`);
  };

  if (!item) return <p style={{ color: "white" }}>Loading item...</p>;

  return (
    <div className="item-details-page">
      <h2>{item.title}</h2>

      <img
        src={`${API_BASE}/item-image/${item.itemId}`}
        alt={item.title}
        onError={(e) => {
          e.target.src = '/loading.png';
          e.target.alt = 'Image unavailable';
        }}
      />

      <p><strong>Description:</strong> {item.description}</p>
      <p><strong>Price:</strong> ${item.price}</p>
      <p><strong>Condition:</strong> {item.condition}</p>
      <p><strong>Listed by:</strong> {item.sellerName}</p>

      <a
        href={`mailto:${item.sellerEmail}?subject=Interested in ${item.title}&body=Hi, I'm ${buyerName} and I'm interested in your listing: ${item.title}`}
      >
        <button className="contact-seller-email-button">
          Contact Seller With Email
        </button>
      </a>

      <button className="Message-seller-button" onClick={handleMessageClick}>
        Message Seller
      </button>

      <button className="review-button" onClick={handleSellerReviewClick}>
        Seller Reviews
      </button>
    </div>
  );
};

export default ItemDetails;
