import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSearchOutline, IoCloseOutline } from 'react-icons/io5';
import './SearchBar.css';

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Searchable items within specific components
  const searchableItems = [
    // About component items
    { id: 1, title: 'About MPASAT', path: '/about', category: 'About', component: 'About' },
    { id: 2, title: 'Our Mission', path: '/about', category: 'About', component: 'About' },
    { id: 3, title: 'Our Vision', path: '/about', category: 'About', component: 'About' },
    { id: 4, title: 'School History', path: '/about', category: 'About', component: 'About' },
    
    // UserAdmission component items
    { id: 5, title: 'Admission Form', path: '/userAdmission', category: 'Admission', component: 'UserAdmission' },
    { id: 6, title: 'Personal Information', path: '/userAdmission', category: 'Admission', component: 'UserAdmission' },
    { id: 7, title: 'Educational Background', path: '/userAdmission', category: 'Admission', component: 'UserAdmission' },
    { id: 8, title: 'Requirements', path: '/userAdmission', category: 'Admission', component: 'UserAdmission' },
    
    // UserTrack component items
    { id: 9, title: 'Track Application', path: '/usertrack', category: 'Tracking', component: 'UserTrack' },
    { id: 10, title: 'Application Status', path: '/usertrack', category: 'Tracking', component: 'UserTrack' },
    { id: 11, title: 'Status Updates', path: '/usertrack', category: 'Tracking', component: 'UserTrack' },
    
    // UserContact component items
    { id: 12, title: 'Contact Form', path: '/contact', category: 'Contact', component: 'UserContact' },
    { id: 13, title: 'Send Message', path: '/contact', category: 'Contact', component: 'UserContact' },
    { id: 14, title: 'Contact Information', path: '/contact', category: 'Contact', component: 'UserContact' },
    
    // Profile component items
    { id: 15, title: 'Profile Settings', path: '/profile', category: 'Profile', component: 'Profile' },
    { id: 16, title: 'Update Profile', path: '/profile', category: 'Profile', component: 'Profile' },
    { id: 17, title: 'Personal Details', path: '/profile', category: 'Profile', component: 'Profile' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    const filteredResults = searchableItems.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filteredResults);
    setIsLoading(false);
  }, [searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleResultClick = (path) => {
    navigate(path);
    setIsOpen(false);
    setSearchQuery('');
  };

  const toggleSearch = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        const input = document.querySelector('.search-input');
        if (input) input.focus();
      }, 300);
    } else {
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  return (
    <div className="search-container" ref={searchRef}>
      <button 
        className="search-toggle"
        onClick={toggleSearch}
        aria-label="Toggle search"
      >
        <IoSearchOutline />
      </button>

      <div className={`search-overlay ${isOpen ? 'active' : ''}`}>
        <div className="search-content">
          <div className="search-header">
            <div className="search-input-wrapper">
              <IoSearchOutline className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search in About, Admission, Tracking, Contact, Profile..."
                value={searchQuery}
                onChange={handleSearch}
              />
              {searchQuery && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <IoCloseOutline />
                </button>
              )}
            </div>
            <button 
              className="close-search"
              onClick={toggleSearch}
              aria-label="Close search"
            >
              <IoCloseOutline />
            </button>
          </div>

          <div className="search-results">
            {isLoading ? (
              <div className="search-loading">Searching...</div>
            ) : searchResults.length > 0 ? (
              <div className="results-list">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    className="result-item"
                    onClick={() => handleResultClick(result.path)}
                  >
                    <span className="result-title">{result.title}</span>
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="no-results">No results found</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar; 