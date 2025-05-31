import React, { useState, useContext, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { push, set, onValue } from 'firebase/database';
import { storage, database } from '../../firebase';
import { AdmissionContext } from '../AdmissionContext';
import AdminNav from '../Admin/AdminNav'
import Footer from '../Common/Footer'
import './AdminResult.css';

const AdminResult = () => {
  const { schoolClasses } = useContext(AdmissionContext) || { schoolClasses: [] };
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch results on component mount
  useEffect(() => {
    let unsubscribe = null;

    const initializeResults = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!database) {
          throw new Error('Database not initialized');
        }

        const resultsRef = ref(database, 'results');
        unsubscribe = onValue(resultsRef, (snapshot) => {
          try {
            const data = snapshot.val();
            if (data) {
              const resultsList = Object.entries(data).map(([id, result]) => ({
                id,
                ...result
              }));
              setResults(resultsList);
            } else {
              setResults([]);
            }
          } catch (err) {
            console.error('Error processing results data:', err);
            setError('Error loading results');
          } finally {
            setIsLoading(false);
          }
        }, (error) => {
          console.error('Database error:', error);
          setError('Error connecting to database');
          setIsLoading(false);
        });
      } catch (err) {
        console.error('Error initializing results:', err);
        setError('Error connecting to database');
        setIsLoading(false);
      }
    };

    initializeResults();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const validateFile = (file) => {
    if (!file) return 'Please select a file';
    if (file.type !== 'application/pdf') return 'Only PDF files are allowed';
    if (file.size > 5 * 1024 * 1024) return 'File size should be less than 5MB';
    return null;
  };

  const uploadFile = async (file, path) => {
    if (!storage) {
      throw new Error('Storage not initialized');
    }
    const fileRef = ref(storage, path);
    const snapshot = await uploadBytes(fileRef, file);
    return getDownloadURL(snapshot.ref);
  };

  const saveToDatabase = async (data) => {
    if (!database) {
      throw new Error('Database not initialized');
    }
    const resultsRef = ref(database, 'results');
    const newResultRef = push(resultsRef);
    await set(newResultRef, data);
    return newResultRef.key;
  };

  const handleUpload = async () => {
    // Reset states
    setError(null);
    setSuccessMessage(null);

    // Validate inputs
    if (!selectedClass || !selectedTerm) {
      setError('Please select both class and term');
      return;
    }

    const fileError = validateFile(selectedFile);
    if (fileError) {
      setError(fileError);
      return;
    }

    try {
      setUploading(true);

      // 1. Upload file to storage
      const timestamp = new Date().getTime();
      const uniqueFileName = `${selectedClass}_${selectedTerm}_${timestamp}.pdf`;
      const storagePath = `results/${selectedClass}/${selectedTerm}/${uniqueFileName}`;
      
      const downloadURL = await uploadFile(selectedFile, storagePath);

      // 2. Save metadata to database
      const resultData = {
        className: selectedClass,
        term: selectedTerm,
        fileName: uniqueFileName,
        originalFileName: selectedFile.name,
        fileUrl: downloadURL,
        uploadDate: new Date().toISOString()
      };

      const resultId = await saveToDatabase(resultData);

      // 3. Update local state
      setResults(prevResults => [...prevResults, { id: resultId, ...resultData }]);

      // 4. Reset form and show success
      setSuccessMessage('Result uploaded successfully!');
      setShowModal(false);
      setSelectedClass('');
      setSelectedTerm('');
      setSelectedFile(null);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload result');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-result-page">
        <AdminNav />
        <main className="admin-result-main">
          <div className="loading-message">Loading results...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="admin-result-page">
      <AdminNav />
      <main className="admin-result-main">
        <div className="admin-result-header">
          <h1>Results Management</h1>
          <button 
            className="upload-btn" 
            onClick={() => setShowModal(true)}
            disabled={uploading}
          >
            + Upload Result
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <div className="results-table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Term</th>
                <th>File Name</th>
                <th>Upload Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id}>
                  <td>{result.className}</td>
                  <td>{result.term}</td>
                  <td>{result.originalFileName || result.fileName}</td>
                  <td>{new Date(result.uploadDate).toLocaleDateString()}</td>
                  <td>
                    <a 
                      href={result.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="download-link"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Upload Result</h2>
              <div className="form-group">
                <label>Select Class:</label>
                <select 
                  value={selectedClass} 
                  onChange={(e) => setSelectedClass(e.target.value)}
                  required
                  disabled={uploading}
                >
                  <option value="">Select a class</option>
                  {schoolClasses.map((cls) => (
                    <option key={cls.id} value={cls.className}>
                      {cls.className}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Select Term:</label>
                <select 
                  value={selectedTerm} 
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  required
                  disabled={uploading}
                >
                  <option value="">Select a term</option>
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>
              <div className="form-group">
                <label>Select PDF File:</label>
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  required
                  disabled={uploading}
                />
                <small>Maximum file size: 5MB</small>
              </div>
              <div className="modal-actions">
                <button 
                  className="cancel-btn" 
                  onClick={() => {
                    setShowModal(false);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  className="upload-submit-btn" 
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
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

export default AdminResult; 