import React, { useState, useEffect, useContext } from 'react';
import { database } from '../../firebase';
import { ref, onValue, off } from 'firebase/database';
import './IDCards.css';
import logo from '../../assets/logo.png';
import { AdmissionContext } from '../AdmissionContext';
import AdminNav from './AdminNav';

const IDCards = () => {
  const [admittedStudents, setAdmittedStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [showClassSelect, setShowClassSelect] = useState(false);
  const [currentAcademicYear, setCurrentAcademicYear] = useState('');
  const { schoolClasses } = useContext(AdmissionContext);

  // Function to process photo URL
  const processPhotoUrl = (photoData) => {
    if (!photoData) return null;
    
    // If it's already a complete URL (starts with http or https), return as is
    if (photoData.startsWith('http://') || photoData.startsWith('https://')) {
      return photoData;
    }
    
    // If it's a base64 string but doesn't have the data:image prefix, add it
    if (photoData.startsWith('/9j/') || photoData.startsWith('iVBOR')) {
      return `data:image/jpeg;base64,${photoData}`;
    }
    
    // If it already has the data:image prefix, return as is
    if (photoData.startsWith('data:image')) {
      return photoData;
    }
    
    return null;
  };

  useEffect(() => {
    // Fetch admitted students
    const admissionsRef = ref(database, 'admissions');
    const settingsRef = ref(database, 'settings/currentAcademicYear');

    // Fetch current academic year
    onValue(settingsRef, (snapshot) => {
      const year = snapshot.val();
      if (year) {
        setCurrentAcademicYear(year);
      }
    });

    // Set classes from context
    if (schoolClasses) {
      const classNames = schoolClasses.map(cls => cls.className).sort();
      setClasses(classNames);
    }

    // Fetch admitted students
    onValue(admissionsRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Raw admissions data:', data);

      if (data) {
        const admitted = Object.entries(data)
          .filter(([_, student]) => student.status === 'Admitted')
          .map(([id, student]) => {
            console.log('Processing student:', student);
            const processedPhoto = processPhotoUrl(student.picture || student.photo);
            console.log('Processed photo URL:', processedPhoto);
            
            return {
              id,
              name: student.name,
              class: student.form || student.class,
              gender: student.sex || student.gender,
              dateOfBirth: student.dob || student.dateOfBirth,
              placeOfBirth: student.pob || student.placeOfBirth,
              fatherName: student.father || student.fatherName,
              motherName: student.mother || student.motherName,
              guardianContact: student.guardian || student.guardianContact,
              photo: processedPhoto,
              academicYear: student.academicYear || currentAcademicYear,
              ...student
            };
          });

        console.log('Processed admitted students:', admitted);
        setAdmittedStudents(admitted);
      }
    });

    return () => {
      off(admissionsRef);
      off(settingsRef);
    };
  }, [schoolClasses, currentAcademicYear]);

  const handlePrint = () => {
    setShowClassSelect(true);
  };

  const handlePrintClass = () => {
    if (!selectedClass) {
      alert('Please select a class first');
      return;
    }

    const filteredStudents = admittedStudents.filter(
      student => student.class === selectedClass || student.form === selectedClass
    );

    if (filteredStudents.length === 0) {
      alert('No students found in the selected class');
      return;
    }

    // Hide the modal and print
    setShowClassSelect(false);
    window.print();
  };

  // Update the PhotoComponent to handle both picture and photo fields
  const PhotoComponent = ({ photoUrl, studentId, className }) => (
    <img 
      src={photoUrl || 'https://via.placeholder.com/150?text=No+Photo'} 
      alt="Student" 
      className={className}
      onError={(e) => {
        console.log('Image load error for student:', studentId);
        e.target.src = 'https://via.placeholder.com/150?text=No+Photo';
      }}
      crossOrigin="anonymous"
    />
  );

  // Filter students by selected class
  const displayedStudents = selectedClass 
    ? admittedStudents.filter(student => student.class === selectedClass || student.form === selectedClass)
    : admittedStudents;

  return (
    <div className="id-cards-page">
      <AdminNav />
      <div className="id-cards-content">
        <div className="id-cards-header no-print">
          <h1>Student ID Cards</h1>
          <button className="print-button" onClick={handlePrint}>
            Print ID Cards
          </button>
        </div>

        {showClassSelect && (
          <div className="class-select-modal no-print">
            <div className="modal-content">
              <h2>Select Class</h2>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">Select a class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <div className="modal-buttons">
                <button onClick={() => setShowClassSelect(false)}>Cancel</button>
                <button 
                  onClick={handlePrintClass} 
                  disabled={!selectedClass}
                >
                  Print Selected Class
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="id-cards-container">
          {displayedStudents.map(student => (
            <div key={student.id} className="id-card">
              <div className="school-header">
                <img src={logo} alt="School Logo" className="school-logo" />
                <div className="school-info">
                  <h1>MBAKWA PHOSPHATE ACADEMY OF SCIENCE, ARTS AND TECHNOLOGY</h1>
                  <h2>ST.LOUIS JUNIOR ACADEMY</h2>
                  <p>Mile 3 Nkwen-Bamenda, Cameroon</p>
                  <p>Reg. No. 697/L/MINESEC/SG/DESG/SDSEPESG/SSGEPESG of 1/12/2022</p>
                  <p>Tel: +237 679953185</p>
                  <p>E-mail: mbakwaphosphateacademy@gmail.com</p>
                </div>
              </div>
              <div className="id-title">
                <h3>STUDENT ID CARD</h3>
                <p>{student.academicYear || currentAcademicYear} Academic Year</p>
              </div>
              <div className="student-info">
                <div className="student-details">
                  <table>
                    <tbody>
                      <tr><td><strong>Name:</strong></td><td>{student.name || ''}</td></tr>
                      <tr><td><strong>Class:</strong></td><td>{student.class || ''}</td></tr>
                      <tr><td><strong>Sex:</strong></td><td>{student.gender || ''}</td></tr>
                      <tr><td><strong>Date of Birth:</strong></td><td>{student.dateOfBirth || ''}</td></tr>
                      <tr><td><strong>Place of Birth:</strong></td><td>{student.placeOfBirth || ''}</td></tr>
                      <tr><td><strong>Father's Name:</strong></td><td>{student.fatherName || ''}</td></tr>
                      <tr><td><strong>Mother's Name:</strong></td><td>{student.motherName || ''}</td></tr>
                      <tr><td><strong>Guardian's Contact:</strong></td><td>{student.guardianContact || ''}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="student-photo-container">
                  <PhotoComponent 
                    photoUrl={student.photo}
                    studentId={student.id}
                    className="student-photo"
                  />
                </div>
              </div>
              <div className="barcode">
                <div className="student-id">ID: {student.id}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IDCards;