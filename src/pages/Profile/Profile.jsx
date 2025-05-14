import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';
import { useParams } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { studentId } = useParams();
  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const id = studentId || localStorage.getItem("studentId");
    if (!id) {
      setError("Please log in first.");
      setLoading(false);
      return;
    }

    axios.get(`${API_BASE}/profile/${id}`)
      .then(res => {
        setUser(res.data);
        setError(null);
      })
      .catch(err => {
        console.error("Failed to load profile:", err);
        setError("Failed to load profile.");
      })
      .finally(() => setLoading(false));

    axios.get(`${API_BASE}/profile-image/${id}`, { responseType: 'blob' })
      .then(res => setProfilePreview(URL.createObjectURL(res.data)))
      .catch(() => setProfilePreview(null));
  }, [studentId, API_BASE]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const payload = {
      contact: user.contact || "",
      primaryMajor: user.primaryMajor || "",
      secondaryMajor: user.secondaryMajor || "",
      bio: user.bio || ""
    };

    axios.put(`${API_BASE}/profile/${studentId}`, payload, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(() => {
      setIsEditing(false);
      setError(null);
    })
    .catch(err => {
      console.error("Save failed:", err);
      setError("Something went wrong while saving!");
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleImageUpload = () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append('file', selectedImage);

    axios.post(`${API_BASE}/upload-profile-image/${studentId}`, formData)
      .then(() => setError(null))
      .catch(() => setError('Image upload failed.'));
  };

  const handleLogout = () => {
    localStorage.removeItem("studentId");
    window.location.href = "/";
  };

  if (loading) return <div>Loading profile...</div>;

  if (error) return (
    <div className="error-container">
      <p style={{ color: 'red' }}>{error}</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  if (!user) return <div>No profile data found.</div>;

  return (
    <div className="profile-container">
      <img
        src={profilePreview || "/default-avatar.png"}
        alt="Profile"
        className="profile-image"
      />

      {isEditing ? (
        <>
          <input type="text" name="contact" value={user.contact || ""} onChange={handleChange} placeholder="Contact Number" />
          <input type="text" name="primaryMajor" value={user.primaryMajor || ""} onChange={handleChange} placeholder="Primary Major" />
          <input type="text" name="secondaryMajor" value={user.secondaryMajor || ""} onChange={handleChange} placeholder="Secondary Major" />
          <textarea name="bio" value={user.bio || ""} onChange={handleChange} placeholder="Tell us about yourself..." />

          <input type="file" accept="image/*" onChange={handleImageChange} />
          <button onClick={handleImageUpload}>Upload Image</button>

          <button onClick={handleSave}>Save</button>
        </>
      ) : (
        <>
          <h1>{user.firstName} {user.lastName}</h1>
          <div className="profile-info">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Contact:</strong> {user.contact}</p>
            <p><strong>Primary Major:</strong> {user.primaryMajor}</p>
            <p><strong>Secondary Major:</strong> {user.secondaryMajor}</p>
            <p><strong>Bio:</strong> {user.bio}</p>
          </div>
          <button onClick={() => setIsEditing(true)}>Edit</button>
        </>
      )}

      <button onClick={handleLogout} style={{ backgroundColor: "#e74c3c", color: "#fff" }}>
        Log Out
      </button>
    </div>
  );
};

export default Profile;
