import React, { useState, useContext } from 'react';
import { AdmissionContext } from '../AdmissionContext';
import './PrintClassList.css';

const PrintClassList = ({ onClose, admissions }) => {
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

    // Filter admitted students for the selected class
    const students = admissions
      .filter(student => 
        student.form === selectedClass && 
        student.status === 'Admitted'
      )
      .sort((a, b) => 
        (a.fullName || '').localeCompare(b.fullName || '')
      );

    if (students.length === 0) {
      alert('No admitted students found for the selected class');
      return;
    }

    // Create printable content
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <div class="print-content">
        <div class="print-header">
          <h1>MPASAT</h1>
          <h2>MODERN PRIVATE SCHOOL OF ARTS AND TECHNOLOGY</h2>
          <h3>P.O Box 123, Bamenda - Cameroon</h3>
          <h3>Tel: +237-123-456-789</h3>
          <h2 class="list-title">Class List For ${selectedClass}</h2>
          <h3>Academic Year: ${academicYear}</h3>
        </div>
        <table class="print-table">
          <thead>
            <tr>
              <th>S/N</th>
              <th>Full Name</th>
              <th>Sex</th>
              <th>Date of Birth</th>
              <th>Place of Birth</th>
              <th>Guardian's Contact</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((student, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${student.name || student.fullName || 'N/A'}</td>
                <td>${student.sex || 'N/A'}</td>
                <td>${student.dob || 'N/A'}</td>
                <td>${student.pob || 'N/A'}</td>
                <td>${student.guardian || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="print-footer">
          <p>Total Students: ${students.length}</p>
          <p>Printed on: ${new Date().toLocaleDateString()}</p>
          <div class="signatures">
            <div class="signature-line">
              <p>_______________________</p>
              <p>Principal's Signature</p>
            </div>
            <div class="signature-line">
              <p>_______________________</p>
              <p>Class Teacher's Signature</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Class List - ${selectedClass}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .print-content { max-width: 1000px; margin: 0 auto; }
            .print-header { text-align: center; margin-bottom: 30px; }
            .print-header h1 { color: #18316d; margin: 0; font-size: 24px; }
            .print-header h2 { margin: 10px 0; font-size: 20px; }
            .print-header h3 { color: #666; margin: 5px 0; font-size: 16px; }
            .list-title { color: #18316d; text-transform: uppercase; margin: 20px 0; }
            .print-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .print-table th, .print-table td { 
              border: 1px solid #000; 
              padding: 8px; 
              text-align: left; 
            }
            .print-table th { 
              background-color: #f8fafc; 
              color: #18316d;
              font-weight: bold;
            }
            .print-table tr:nth-child(even) { background-color: #f9fafb; }
            .print-footer { 
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 14px;
              color: #666;
            }
            .signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
              padding: 0 50px;
            }
            .signature-line {
              text-align: center;
            }
            .signature-line p {
              margin: 5px 0;
            }
            @media print {
              body { margin: 0; }
              .print-table th { background-color: #f8fafc !important; }
              .print-table, .print-table th, .print-table td {
                border-color: #000 !important;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

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