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

  // Fetch profile data and image
  useEffect(() => {
    const id = studentId || localStorage.getItem("studentId");
    if (!id) {
      setError("Please log in first.");
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:8000/profile/${id}`)
      .then(res => {
        setUser(res.data);
        setError(null);
      })
      .catch(err => {
        console.error("Failed to load profile:", err);
        setError("Failed to load profile.");
      })
      .finally(() => setLoading(false));

    axios.get(`http://localhost:8000/profile-image/${id}`, { responseType: 'blob' })
      .then(res => setProfilePreview(URL.createObjectURL(res.data)))
      .catch(() => setProfilePreview(null));
  }, [studentId]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    axios.put(`http://localhost:8000/profile/${studentId}`, user)
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

    axios.post(`http://localhost:8000/upload-profile-image/${studentId}`, formData)
      .then(() => setError(null))
      .catch(() => setError('Image upload failed.'));
  };

  const handleLogout = () => {
    localStorage.removeItem("studentId");
    window.location.href = "/";
  };

  // Loading or error states
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
          <input type="text" name="name" value={user.name || ""} onChange={handleChange} placeholder="Full Name" />
          <input type="email" name="email" value={user.email || ""} onChange={handleChange} placeholder="Email" />
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
          <h1>{user.name}</h1>
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
