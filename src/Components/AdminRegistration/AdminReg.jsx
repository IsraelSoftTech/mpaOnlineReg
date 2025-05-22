import React, { useState, useContext, useEffect } from 'react';
import { AdmissionContext } from '../AdmissionContext';
import { ref, push, set, onValue } from 'firebase/database';
import { database } from '../../firebase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './AdminReg.css';
import AdminNav from '../Admin/AdminNav';

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

        if (width > 800) {
          height = Math.round((height * 800) / width);
          width = 800;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          'image/jpeg',
          0.7
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const AdminReg = () => {
  const [formData, setFormData] = useState({
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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const { schoolClasses } = useContext(AdmissionContext);
  const navigate = useNavigate();

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

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    setFileError('');

    if (name === 'avg') {
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
              setFormData((prev) => ({ ...prev, [name]: reader.result }));
            };
            reader.readAsDataURL(compressedImage);
          } else {
            const reader = new FileReader();
            reader.onloadend = () => {
              setFormData((prev) => ({ ...prev, [name]: reader.result }));
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
            setFormData((prev) => ({ ...prev, [name]: reader.result }));
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        console.error('Error processing file:', err);
        setFileError('Error processing file. Please try again.');
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const admissionRef = ref(database, 'admissions');
      const newAdmissionRef = push(admissionRef);
      await set(newAdmissionRef, {
        ...formData,
        status: 'Pending',
        timestamp: Date.now(),
        registeredBy: 'admin'
      });

      setShowSuccess(true);
      setFormData({
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
      });

      // Wait for 3 seconds before redirecting
      setTimeout(() => {
        navigate('/admintrack');
      }, 3000);
    } catch (error) {
      console.error('Error registering student:', error);
      toast.error('Failed to register student. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-reg-container">
      <AdminNav />
      <div className="admin-reg-content">
        <h1>Register New Student</h1>
        {showSuccess && (
          <div className="success-message">
            Student registered successfully! Redirecting to student list...
          </div>
        )}
        <form onSubmit={handleSubmit} className="admin-reg-form">
          <div className="form-group">
            <label htmlFor="studentType">Student Type</label>
            <select
              id="studentType"
              name="studentType"
              value={formData.studentType}
              onChange={handleChange}
              required
            >
              <option value="">Select Student Type</option>
              <option value="New Student">New Student</option>
              <option value="Old Student">Old Student</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sex">Sex</label>
            <select
              id="sex"
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="academicYear">Academic Year</label>
            <select
              id="academicYear"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              required
            >
              <option value="">Select Academic Year</option>
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dob">Date of Birth</label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pob">Place of Birth</label>
            <input
              type="text"
              id="pob"
              name="pob"
              value={formData.pob}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="father">Father's Name</label>
            <input
              type="text"
              id="father"
              name="father"
              value={formData.father}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mother">Mother's Name</label>
            <input
              type="text"
              id="mother"
              name="mother"
              value={formData.mother}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="guardian">Guardian's Telephone</label>
            <input
              type="tel"
              id="guardian"
              name="guardian"
              value={formData.guardian}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="avg">Previous Average</label>
            <input
              type="number"
              id="avg"
              name="avg"
              value={formData.avg}
              onChange={handleChange}
              step="0.01"
              min="0"
              max="20"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="form">Seeking admission to class</label>
            <select
              id="form"
              name="form"
              value={formData.form}
              onChange={handleChange}
              required
            >
              <option value="">Select Class</option>
              {schoolClasses.map(cls => (
                <option key={cls.id} value={cls.className}>{cls.className}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="vocation">Interested vocation department</label>
            <select
              id="vocation"
              name="vocation"
              value={formData.vocation}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.title}>{dept.title}</option>
              ))}
            </select>
          </div>

          {fileError && (
            <div className="error-message">
              {fileError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="picture">Student Picture (Max 500KB)</label>
            <input
              type="file"
              id="picture"
              name="picture"
              accept="image/*"
              onChange={handleChange}
              required
            />
            <small className="file-hint">Recommended: JPG or PNG format, max 500KB</small>
          </div>

          <div className="form-group">
            <label htmlFor="report">Student Previous Report Card (Max 2MB)</label>
            <input
              type="file"
              id="report"
              name="report"
              accept="application/pdf"
              onChange={handleChange}
              required
            />
            <small className="file-hint">PDF format only, max 2MB</small>
          </div>

          <button type="submit" disabled={isSubmitting || !!fileError}>
            {isSubmitting ? 'Registering...' : 'Register Student'}
          </button>
        </form>
        <button 
          className="view-students-btn"
          onClick={() => navigate('/admintrack')}
        >
          See Registered Students
        </button>
      </div>
    </div>
  );
};

export default AdminReg; 