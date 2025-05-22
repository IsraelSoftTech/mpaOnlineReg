import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import './AdminReg.css';
import { AdmissionContext } from '../AdmissionContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';
import AdminNav from '../Admin/AdminNav';
import Footer from '../Common/Footer';

const generateAcademicYears = () => {
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 7; i++) {
    const startYear = currentYear + i;
    const endYear = startYear + 1;
    years.push(`${startYear}/${endYear}`);
  }
  return years;
};

const academicYears = generateAcademicYears();

const initialState = {
  studentType: '',
  name: '',
  sex: '',
  dob: '',
  pob: '',
  father: '',
  mother: '',
  guardian: '',
  avg: '',
  form: '',
  vocation: '',
  picture: null,
  report: null,
  academicYear: ''
};

const MAX_IMAGE_SIZE = 500 * 1024; // 500KB
const MAX_PDF_SIZE = 2 * 1024 * 1024; // 2MB

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > 800) {
          height = Math.round((height * 800) / width);
          width = 800;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Blob
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          'image/jpeg',
          0.7 // compression quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const AdminReg = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [form, setForm] = useState(initialState);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { addAdmission, schoolClasses } = useContext(AdmissionContext);
  const [fileError, setFileError] = useState('');

  // Fetch departments from database
  useEffect(() => {
    const departmentsRef = ref(database, 'departments');
    const unsubscribe = onValue(departmentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const departmentsList = Object.entries(data).map(([id, dept]) => ({
          id,
          title: dept.title
        }));
        setDepartments(departmentsList);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  useEffect(() => {
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

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    setFileError('');

    if (name === 'avg') {
      // Validate average to be between 0 and 20
      if (value && (parseFloat(value) < 0 || parseFloat(value) > 20)) {
        setFileError('Average must be between 0 and 20');
        return;
      }
    }

    if (files && files[0]) {
      const file = files[0];

      try {
        if (name === 'picture') {
          if (file.size > MAX_IMAGE_SIZE) {
            const compressedImage = await compressImage(file);
            if (compressedImage.size > MAX_IMAGE_SIZE) {
              setFileError('Image size too large. Please select an image under 500KB.');
              return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
              setForm((prev) => ({ ...prev, [name]: reader.result }));
            };
            reader.readAsDataURL(compressedImage);
          } else {
            const reader = new FileReader();
            reader.onloadend = () => {
              setForm((prev) => ({ ...prev, [name]: reader.result }));
            };
            reader.readAsDataURL(file);
          }
        } else if (name === 'report') {
          if (file.size > MAX_PDF_SIZE) {
            setFileError('PDF size too large. Please select a PDF under 2MB.');
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            setForm((prev) => ({ ...prev, [name]: reader.result }));
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        console.error('Error processing file:', err);
        setFileError('Error processing file. Please try again.');
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const success = await addAdmission({
        ...form,
        status: 'Pending',
        timestamp: new Date().toISOString(),
        username: 'admin_registered' // Custom username for admin registrations
      });
      if (success) {
        setForm(initialState);
        setSuccess(true);
        // If student type is "New Student", redirect to AdminTrack after 2 seconds
        if (form.studentType === 'New Student') {
          setTimeout(() => {
            navigate('/admintrack', { state: { admissionData: form } });
          }, 2000);
        } else {
          // For "Old Student", just reset success message after 2 seconds
          setTimeout(() => {
            setSuccess(false);
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setFileError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="userad-wrapper">
      <AdminNav />
      <main className="userad-main">
        <h2 className="userad-title-main">Admission Application</h2>
        {success && (
          <div className="success-message">Application submitted successfully!</div>
        )}
        <form className="userad-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="studentType" className='stutype'>Student Type</label>
            <select
              id="studentType"
              name="studentType"
              value={form.studentType}
              onChange={handleChange}
              required
            >
              <option value="">Select Student Type</option>
              <option value="New Student">New Student</option>
              <option value="Old Student">Old Student</option>
            </select>
          </div>
          <div className="form-row">
            <label>Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required />
          </div>
          <div className="form-row">
            <label>Sex</label>
            <select name="sex" value={form.sex} onChange={handleChange} required>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="form-row">
            <label>Academic Year</label>
            <select name="academicYear" value={form.academicYear} onChange={handleChange} required>
              <option value="">Select Academic Year</option>
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Date of Birth</label>
            <input type="date" name="dob" value={form.dob} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <label>Place of Birth</label>
            <input type="text" name="pob" value={form.pob} onChange={handleChange} placeholder="Place of Birth" required />
          </div>
          <div className="form-row">
            <label>Father's Name</label>
            <input type="text" name="father" value={form.father} onChange={handleChange} placeholder="Father's Name" required />
          </div>
          <div className="form-row">
            <label>Mother's Name</label>
            <input type="text" name="mother" value={form.mother} onChange={handleChange} placeholder="Mother's Name" required />
          </div>
          <div className="form-row">
            <label>Guardian's Telephone</label>
            <input type="tel" name="guardian" value={form.guardian} onChange={handleChange} placeholder="Phone Number" required />
          </div>
          <div className="form-row">
            <label>Previous Average</label>
            <input 
              type="number" 
              name="avg" 
              value={form.avg} 
              onChange={handleChange} 
              step="0.01" 
              min="0"
              max="20"
              placeholder="Enter average (0-20)" 
              required 
            />
          </div>
          <div className="form-row">
            <label>Seeking admission to class</label>
            <select name="form" value={form.form} onChange={handleChange} required>
              <option value="">Select Class</option>
              {schoolClasses.map(cls => (
                <option key={cls.id} value={cls.className}>{cls.className}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Interested vocation department</label>
            <select name="vocation" value={form.vocation} onChange={handleChange} required>
              <option value="">Select</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.title}>{dept.title}</option>
              ))}
            </select>
          </div>
          {fileError && (
            <div className="error-message" style={{ marginBottom: '16px' }}>
              {fileError}
            </div>
          )}
          <div className="form-row">
            <label>Student Picture (Max 500KB)</label>
            <input 
              type="file" 
              name="picture" 
              accept="image/*" 
              onChange={handleChange} 
              required 
            />
            <small className="file-hint">Recommended: JPG or PNG format, max 500KB</small>
          </div>
          <div className="form-row">
            <label>Student Previous Report Card (Max 2MB)</label>
            <input 
              type="file" 
              name="report" 
              accept="application/pdf" 
              onChange={handleChange} 
              required 
            />
            <small className="file-hint">PDF format only, max 2MB</small>
          </div>
          <button 
            className="submit-btn" 
            type="submit"
            disabled={submitting || !!fileError}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
          <button 
            type="button" 
            className="view-students-btn"
            onClick={() => navigate('/admintrack', { state: { viewAll: true } })}
          >
            View Registered Students
          </button>
        </form>
      </main>
     
    </div>
  );
};

export default AdminReg; 