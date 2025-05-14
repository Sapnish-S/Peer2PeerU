import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import './Search.css';

const useQuery = () => new URLSearchParams(useLocation().search);

const Search = () => {
  const query = useQuery().get('query') || '';
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.trim()) {
      axios.get(`${import.meta.env.VITE_API_URL}/search?query=${encodeURIComponent(query)}`)
        .then(res => setResults(res.data))
        .catch(err => console.error("Search failed:", err));
    }
  }, [query]);

  return (
    <div className="search-page">
      <div className="search-results">
        {results.length > 0 ? results.map(item => (
          <Link to={`/item/${item.itemId}`} key={item.itemId} className="item-card-link">
            <div className="item-card">
              <img
                src={`${import.meta.env.VITE_API_URL}/item-image/${item.itemId}`}
                alt={item.title}
                onError={(e) => {
                  e.target.src = '/loading.png';
                  e.target.alt = 'Image not found';
                }}
              />
              <h3>{item.title}</h3>
              <p>{item.condition}</p>
              <p className="item-price">${item.price}</p>
            </div>
          </Link>
        )) : (
          <p style={{ color: 'white' }}>No results found.</p>
        )}
      </div>
    </div>
  );
};

export default Search;
