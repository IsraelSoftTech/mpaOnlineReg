import React, { useState, useContext, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';
import { AdmissionContext } from '../AdmissionContext';
import UserNav from '../Shared/UserNav'
import Footer from '../Common/Footer'
import './UserResult.css';

const UserResult = () => {
  const { schoolClasses } = useContext(AdmissionContext);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [studentName, setStudentName] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundResult, setFoundResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Fetch all results
    const resultsRef = ref(database, 'results');
    onValue(resultsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const resultsList = Object.entries(data).map(([id, result]) => ({
          id,
          ...result
        }));
        setResults(resultsList);
      }
    });
  }, []);

  const handleClassSelect = () => {
    if (!selectedClass) {
      setErrorMessage('Please select a class');
      return;
    }
    setShowClassModal(false);
    setShowNameModal(true);
  };

  const handleSearch = () => {
    if (!studentName.trim()) {
      setErrorMessage('Please enter your name');
      return;
    }

    setSearching(true);
    setErrorMessage('');

    // Search for the result
    const result = results.find(r => 
      r.className === selectedClass && 
      r.fileName.toLowerCase().includes(studentName.toLowerCase())
    );

    if (result) {
      setFoundResult(result);
    } else {
      setErrorMessage('No result found for the given class and name');
    }

    setSearching(false);
    setShowNameModal(false);
  };

  return (
    <div className="user-result-page">
      <UserNav />
      <main className="user-result-main">
        <div className="user-result-header">
          <h1>View Your Results</h1>
          <button 
            className="view-result-btn"
            onClick={() => setShowClassModal(true)}
          >
            View Result
          </button>
        </div>

        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}

        {foundResult && (
          <div className="result-card">
            <h2>Result Found</h2>
            <div className="result-details">
              <p><strong>Class:</strong> {foundResult.className}</p>
              <p><strong>Term:</strong> {foundResult.term}</p>
              <p><strong>File Name:</strong> {foundResult.fileName}</p>
              <p><strong>Upload Date:</strong> {new Date(foundResult.uploadDate).toLocaleDateString()}</p>
            </div>
            <a 
              href={foundResult.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="download-result-btn"
            >
              Download Result
            </a>
          </div>
        )}

        {/* Class Selection Modal */}
        {showClassModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Select Your Class</h2>
              <div className="form-group">
                <label>Class:</label>
                <select 
                  value={selectedClass} 
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">Select a class</option>
                  {schoolClasses.map((cls) => (
                    <option key={cls.id} value={cls.className}>
                      {cls.className}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button 
                  className="cancel-btn" 
                  onClick={() => setShowClassModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="submit-btn" 
                  onClick={handleClassSelect}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Name Input Modal */}
        {showNameModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Enter Your Name</h2>
              <div className="form-group">
                <label>Full Name:</label>
                <input 
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="modal-actions">
                <button 
                  className="cancel-btn" 
                  onClick={() => setShowNameModal(false)}
                >
                  Back
                </button>
                <button 
                  className="submit-btn" 
                  onClick={handleSearch}
                  disabled={searching}
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default UserResult; 