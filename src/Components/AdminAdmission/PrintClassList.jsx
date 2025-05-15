import React, { useState, useContext } from 'react';
import { AdmissionContext } from '../AdmissionContext';
import './PrintClassList.css';

const PrintClassList = ({ isOpen, onClose, onPrint, admissions }) => {
  const { schoolClasses } = useContext(AdmissionContext);
  const [selectedClass, setSelectedClass] = useState('');
  const [academicYear, setAcademicYear] = useState('2023/2024');

  // Get current academic year options
  const currentYear = new Date().getFullYear();
  const academicYears = [
    `${currentYear-1}/${currentYear}`,
    `${currentYear}/${currentYear+1}`,
    `${currentYear+1}/${currentYear+2}`
  ];

  const handlePrint = () => {
    if (!selectedClass || !academicYear) {
      alert('Please select both class and academic year');
      return;
    }

    // Filter and sort students
    const students = admissions
      .filter(student => {
        // Check if the student's form matches the selected class and is approved
        return student.form && 
               student.form === selectedClass && 
               student.status && 
               student.status.toLowerCase() === 'confirmed';
      })
      .sort((a, b) => {
        // Sort by name, handling null/undefined cases
        const nameA = (a.name || a.fullName || '').toLowerCase();
        const nameB = (b.name || b.fullName || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });

    // Show message if no students found
    if (students.length === 0) {
      alert('No confirmed students found for the selected class');
      return;
    }

    onPrint(students, selectedClass, academicYear);
  };

  if (!isOpen) return null;

  return (
    <div className="print-dialog-overlay">
      <div className="print-dialog">
        <h2>Print Class List</h2>
        <form className="print-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>Select Class:</label>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              required
            >
              <option value="">Select a class</option>
              {schoolClasses.map((classItem) => (
                <option key={classItem.id} value={classItem.className}>
                  {classItem.className}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Academic Year:</label>
            <select 
              value={academicYear} 
              onChange={(e) => setAcademicYear(e.target.value)}
              required
            >
              {academicYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="print-dialog-buttons">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="button" 
              className="print-button" 
              onClick={handlePrint}
              disabled={!selectedClass || !academicYear}
            >
              Print List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrintClassList; 