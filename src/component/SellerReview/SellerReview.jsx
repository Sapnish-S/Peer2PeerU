import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './SellerReview.css';

const SellerReview = () => {
  const { sellerId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  const studentId = localStorage.getItem("studentId");

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/seller-reviews/${sellerId}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch seller reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [sellerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("seller_id", sellerId);
      formData.append("reviewer_id", studentId);
      formData.append("rating", rating);
      formData.append("comment", comment);

      await axios.post("http://localhost:8000/seller-review", formData);
      fetchReviews();
      setComment('');
    } catch (err) {
      console.error("Failed to submit review:", err);
    }
  };

  return (
    <div className="seller-review-container">
      <h2>Seller Reviews</h2>

      <form onSubmit={handleSubmit} className="review-form">
        <label>Rating:</label>
        <select value={rating} onChange={(e) => setRating(e.target.value)} required>
          <option value="">Select</option>
          {[1, 2, 3, 4, 5].map(star => (
            <option key={star} value={star}>{star} Star{star > 1 && 's'}</option>
          ))}
        </select>

        <label>Comment:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Write your review..."
          required
        />

        <button type="submit">Submit Review</button>
      </form>

      <div className="reviews-list">
        {loading ? <p>Loading...</p> :
          reviews.length === 0 ? <p>No reviews yet.</p> :
          reviews.map((review, index) => (
            <div key={index} className="review-box">
              <div className="review-header">
                <strong>{review.reviewerName}</strong>
                <span className="rating">⭐ {review.rating}/5</span>
              </div>
              <p>{review.comment}</p>
              <small>{new Date(review.timestamp).toLocaleString()}</small>
            </div>
        ))}
      </div>
    </div>
  );
};

export default SellerReview;