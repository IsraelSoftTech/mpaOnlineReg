import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { FaPrint } from 'react-icons/fa';
import './AdminAdmission.css';
import { AdmissionContext } from '../AdmissionContext';
import PrintClassList from './PrintClassList';
import { database } from '../../firebase';
import { ref, update } from 'firebase/database';

const AdminAdmission = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const menuRef = React.useRef(null);
  const buttonRef = React.useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { admissions } = useContext(AdmissionContext);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleViewReport = (reportUrl) => {
    if (reportUrl) {
      window.open(reportUrl, '_blank');
    }
  };

  const handlePrint = (students, className, academicYear) => {
    // Create the print content
    const printContent = document.createElement('div');
    printContent.className = 'print-content';
    printContent.innerHTML = `
      <div class="school-header">
        <h1>MBAKWA PHOSPHATE ACADEMY OF SCIENCE, ARTS AND TECHNOLOGY-ST.LOUIS JUNIOR ACADEMY</h1>
        <div class="school-info">
          <p>Reg. No. 697/L/MINESEC/SG/DESG/SDSEPESG/SSGEPESG of 1/12/2022</p>
          <p>Tel: +237 679953185</p>
          <p>E-mail: mbakwaphosphateacademy@gmail.com</p>
        </div>
        <h2>Class List for ${className} - Academic Year ${academicYear}</h2>
      </div>
      <table class="class-list-table">
        <thead>
          <tr>
            <th>S/N</th>
            <th>Name</th>
            <th>Sex</th>
            <th>Place of Birth</th>
            <th>Date of Birth</th>
            <th>Guardian's Contact</th>
          </tr>
        </thead>
        <tbody>
          ${students.map((student, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${student.name || student.fullName || 'N/A'}</td>
              <td>${student.sex || 'N/A'}</td>
              <td>${student.pob || 'N/A'}</td>
              <td>${student.dob || 'N/A'}</td>
              <td>${student.guardian || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Class List - ${className}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 1.5cm;
              }
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.5;
            }
            .print-content {
              max-width: 100%;
              margin: 0 auto;
            }
            .school-header {
              text-align: center;
              margin-bottom: 2em;
            }
            .school-header h1 {
              font-size: 18px;
              margin-bottom: 0.5em;
              color: #18316d;
            }
            .school-info {
              font-size: 12px;
              margin-bottom: 1em;
            }
            .school-info p {
              margin: 0.2em 0;
            }
            h2 {
              font-size: 16px;
              margin-bottom: 1em;
              color: #18316d;
            }
            .class-list-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }
            .class-list-table th,
            .class-list-table td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            .class-list-table th {
              background-color: #f5f5f5;
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setShowPrintDialog(false);
  };

  const handleStatusUpdate = async (admissionId, newStatus) => {
    try {
      const updates = {};
      updates[`/admissions/${admissionId}/status`] = newStatus;
      await update(ref(database), updates);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="admin-wrapper">
      <header className="app-header">
        <div className="logo-section">
          <img src="/logo192.png" alt="logo" className="app-logo" />
          <span className="app-brand">MPASAT</span>
        </div>
        <button
          ref={buttonRef}
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <RiCloseFill size={24} /> : <RiMenu3Line size={24} />}
        </button>
        <nav ref={menuRef} className={`app-nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <button 
            className={`app-nav-link${location.pathname === '/admin' ? ' active' : ''}`}
            onClick={() => navigate('/admin')}
          >
            Overview
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/adminpay' ? ' active' : ''}`}
            onClick={() => navigate('/adminpay')}
          >
            Payments
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/departments' ? ' active' : ''}`}
            onClick={() => navigate('/departments')}
          >
            Create Departments
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/classes' ? ' active' : ''}`}
            onClick={() => navigate('/classes')}
          >
            Classes
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/idcards' ? ' active' : ''}`}
            onClick={() => navigate('/idcards')}
          >
            ID Cards
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/adminAdmission' ? ' active' : ''}`}
            onClick={() => navigate('/adminAdmission')}
          >
            Admission
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/admincontact' ? ' active' : ''}`}
            onClick={() => navigate('/admincontact')}
          >
            Contact
          </button>
          <button className="app-nav-link logout" onClick={() => navigate('/signin')}>Log out</button>
        </nav>
      </header>
      <main className="admin-main">
        <div className="admin-header-actions">
          <h2 className="admin-overview-title">Admission Applications</h2>
          <button 
            className="print-class-list-btn"
            onClick={() => setShowPrintDialog(true)}
          >
            <FaPrint /> Print Class List
          </button>
        </div>
        <div className="adminad-table-wrapper">
          <table className="adminad-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Student Type</th>
                <th>Sex</th>
                <th>DOB</th>
                <th>Place of Birth</th>
                <th>Father's Name</th>
                <th>Mother's Name</th>
                <th>Guardian's Phone</th>
                <th>Previous Average</th>
                <th>Form</th>
                <th>Department</th>
                <th>Picture</th>
                <th>Report Card</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admissions && admissions.map((admission) => (
                <tr key={admission.id}>
                  <td>{admission.name || 'N/A'}</td>
                  <td>{admission.studentType || 'N/A'}</td>
                  <td>{admission.sex || 'N/A'}</td>
                  <td>{admission.dob || 'N/A'}</td>
                  <td>{admission.pob || 'N/A'}</td>
                  <td>{admission.father || 'N/A'}</td>
                  <td>{admission.mother || 'N/A'}</td>
                  <td>{admission.guardian || 'N/A'}</td>
                  <td>{admission.avg || 'N/A'}</td>
                  <td>{admission.form || 'N/A'}</td>
                  <td>{admission.vocation || 'N/A'}</td>
                  <td>
                    {admission.picture && (
                      <img 
                        src={admission.picture} 
                        alt={admission.name || 'Student'} 
                        className="student-picture"
                      />
                    )}
                  </td>
                  <td>
                    {admission.report && (
                      <button 
                        className="adminad-link" 
                        onClick={() => handleViewReport(admission.report)}
                      >
                        View Report
                      </button>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge status-${(admission.status || 'pending').toLowerCase()}`}>
                      {admission.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    {admission.studentType === 'Old Student' && admission.status === 'Pending' && (
                      <div className="action-buttons">
                        <button
                          className="admit-btn"
                          onClick={() => handleStatusUpdate(admission.id, 'Admitted')}
                        >
                          Admitted
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleStatusUpdate(admission.id, 'Rejected')}
                        >
                          Fake
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <footer className="footer">
        <div className="footer-logo">ONLINE ADMISSION</div>
        <div className="footer-center">MPASAT, All Rights Reserved - 2025</div>
        <div className="footer-socials">
          <span>Follow us on:</span>
          <span className="icon social-icon instagram"></span>
          <span className="icon social-icon facebook"></span>
          <span className="icon social-icon tiktok"></span>
          <span className="icon social-icon twitter"></span>
        </div>
      </footer>

      <PrintClassList
        isOpen={showPrintDialog}
        onClose={() => setShowPrintDialog(false)}
        onPrint={handlePrint}
        admissions={admissions}
      />
    </div>
  );
};

export default AdminAdmission; 