import React, { useEffect ,useState} from 'react';
import Navbar from '../Navbar/Navbar';
import './Home.css';
import axios from 'axios';
import Footer from '../Footer/Footer';
import { Link } from 'react-router-dom';
const Home = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    axios.get("http://localhost:8000/items")
      .then(res => {
        setItems(res.data);
        setIsLoading(false); // ✅ set to false after fetch
      })
      .catch(err => {
        console.error("Failed to fetch items", err);
        setIsLoading(false);
      });
  }, []);
  

  return (
    <>
     
      <div className="home-container">

        {/* Left Image */}
        <div className="home-left">
          <img src="/HomeCover.png" alt="Home Cover" className="home-cover-img" />
        </div>

       
        <div className="home-right">
    <div className="featured-listings">
      <h2>Featured Listings</h2>
        {isLoading ? (
          <p style={{ color: "white" }}>Loading listings...</p>
        ) : (
          <div className="items-grid">
            {items.slice(0,4).map(item => (
              <Link to={`/item/${item.itemId}`} key={item.itemId} className="item-card-link">
              <div className="item-card">
                <img
                  src={`http://localhost:8000/item-image/${item.itemId}`}
                  alt={item.title}
                  onError={(e) => {e.target.src = '/loading.png'; 
                    e.target.alt = "Image unavailable";}}
                />
                <h3>{item.title}</h3>
                <p>{item.condition}</p>
                <p className="item-price">${item.price}</p>
              </div>
            </Link>
            
            ))}
          </div>
          
        )}

    </div>
  </div>
</div>
      
    </>
  );
};

export default Home;
