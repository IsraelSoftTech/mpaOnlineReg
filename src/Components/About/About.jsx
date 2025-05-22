import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill, RiArrowRightLine } from 'react-icons/ri';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook, FaYoutube, FaDownload } from 'react-icons/fa';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';
import './About.css';
import logo from '../../assets/logo.png';
import campus1 from '../../assets/campus1.jpg';
import campus2 from '../../assets/campus2.jpg';
import campus3 from '../../assets/campus3.jpg';
import { AdmissionContext } from '../AdmissionContext';
import html2pdf from 'html2pdf.js';

const About = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { schoolClasses } = useContext(AdmissionContext);
  const [departments, setDepartments] = useState([]);
  const [displayText, setDisplayText] = useState('');
  const [allImages, setAllImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentCampusIndex, setCurrentCampusIndex] = useState(0);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const fullText = 'Welcome to MPASAT';
  const campusImages = [campus1, campus2, campus3];

  useEffect(() => {
    let timeout;
    let currentIndex = 0;
    let isDeleting = false;

    const type = () => {
      if (isDeleting) {
        setDisplayText(fullText.substring(0, currentIndex));
        currentIndex--;
        
        if (currentIndex === 0) {
          isDeleting = false;
          timeout = setTimeout(type, 500); // Pause before typing again
        } else {
          timeout = setTimeout(type, 50); // Delete speed
        }
      } else {
        setDisplayText(fullText.substring(0, currentIndex));
        currentIndex++;
        
        if (currentIndex > fullText.length) {
          isDeleting = true;
          timeout = setTimeout(type, 1000); // Pause before deleting
        } else {
          timeout = setTimeout(type, 100); // Type speed
        }
      }
    };

    timeout = setTimeout(type, 100);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (departments.length > 0) {
      const images = departments.reduce((acc, dept) => {
        if (dept.images && Array.isArray(dept.images)) {
          return [...acc, ...dept.images.map(img => ({
            url: img,
            department: dept.title
          }))];
        }
        return acc;
      }, []);
      setAllImages(images);
    }
  }, [departments]);

  useEffect(() => {
    if (allImages.length > 0) {
      const slideInterval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 1000);

      return () => clearInterval(slideInterval);
    }
  }, [allImages]);

  useEffect(() => {
    const campusInterval = setInterval(() => {
      setCurrentCampusIndex((prevIndex) => 
        prevIndex === campusImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(campusInterval);
  }, []);

  useEffect(() => {
    const departmentsRef = ref(database, 'departments');
    onValue(departmentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const departmentsList = Object.entries(data).map(([id, dept]) => ({
            id,
            ...dept
        }));
        setDepartments(departmentsList);
      }
    });
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isSpecialClass = (className) => {
    const specialClasses = [
      'Form Five(5) Arts',
      'Form Five(5) Science',
      'Lower Sixth Arts',
      'Lower Sixth Science',
      'Upper Sixth Arts',
      'Upper Sixth Science',
      'Form Five(5) Commercial',
      'Upper Sixth Commercial',
      'Form 4 Technical',
      'Form 5 Technical'
    ];
    return specialClasses.includes(className);
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('fee-table-container');
    const opt = {
      margin: 0.5,
      filename: 'MPASAT_Fee_Structure.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a3', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="page-wrapper">
      <header className="header-about">
        <div className="logo"><img src={logo} alt=""/></div>
        <div className="header-title">MPASAT</div>
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
            className={`app-nav-link${location.pathname === '/about' ? ' active' : ''}`} 
            onClick={() => navigate('/about')}
          >
            About
          </button>
          <button 
            className="app-nav-link" 
            onClick={() => navigate('/signin')}
          >
            Admission
          </button>
        </nav>
      </header>

      <main className="about-main">
        {/* Welcome Section */}
        <section className="about-welcome-section">
          <h1>
            <span className="typing-text">{displayText}</span>
          </h1>
         
          <div className="registration-number">
            Reg. No. 697/L/MINESEC/SG/DESG/SDSEPESG/SSGEPESG of 1/12/2022
          </div>
           <button className="get-started-btn" onClick={() => navigate('/signin')}>
            Get Started <RiArrowRightLine className="icon" />
          </button>
        </section>

        {/* Image Slider Section */}
        {allImages.length > 0 && (
          <section className="image-slider-section">
            <div className="slider-container">
              <div className="slider-image-wrapper">
                <img 
                  src={allImages[currentImageIndex].url} 
                  alt={`${allImages[currentImageIndex].department}`} 
                  className="slider-image"
                />
                <div className="slider-caption">
                  {allImages[currentImageIndex].department}
                </div>
              </div>
              <div className="slider-indicators">
                {allImages.map((_, index) => (
                  <span 
                    key={index} 
                    className={`slider-dot ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* About Us Section */}
        <section className="about-us-section">
          <h2>About Us</h2>
          <p>
            MPASAT is a unique educational center that combines grammar, technical, and vocational 
            education to provide comprehensive learning opportunities. Our institution is committed 
            to delivering quality education that prepares students for both academic excellence and 
            practical skills development. We pride ourselves in offering a diverse range of programs 
            that cater to various career paths and personal development goals.
          </p>
        </section>

        {/* Location Section */}
        <section className="location-section">
          <h2>Our Location</h2>
          <div className="location-content">
            <FaMapMarkerAlt className="location-icon" />
            <div className="location-details">
              <p>Mile 3 Nkwen</p>
              <p>Bamenda</p>
              <p>North West Region</p>
              <p>Cameroon</p>
            </div>
          </div>
        </section>

        {/* Campus Section */}
        <section className="campus-section">
          <h2>Our Campus</h2>
          <div className="campus-slider">
            <div className="slider-container">
              <div className="slider-image-wrapper">
                <img 
                  src={campusImages[currentCampusIndex]} 
                  alt={`Campus View ${currentCampusIndex + 1}`} 
                  className="slider-image"
                />
              </div>
              <div className="slider-indicators">
                {campusImages.map((_, index) => (
                  <span 
                    key={index} 
                    className={`slider-dot ${index === currentCampusIndex ? 'active' : ''}`}
                    onClick={() => setCurrentCampusIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact-section">
          <h2>Contact Information</h2>
          <div className="contact-details">
            <div className="contact-item">
              <FaPhone className="contact-icon" />
              <a href="tel:+237679953185">+237 679953185</a>
            </div>
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <a href="mailto:mbakwaphosphate@gmail.com">mbakwaphosphate@gmail.com</a>
            </div>
            <div className="contact-item">
              <FaFacebook className="contact-icon" />
              <a href="https://www.facebook.com/Mpasat" target="_blank" rel="noopener noreferrer">Mpasat</a>
            </div>
            <div className="contact-item">
              <FaYoutube className="contact-icon" />
              <a href="https://youtube.com/@mbakwaphosphateacademy3992" target="_blank" rel="noopener noreferrer">
                Mbakwaphosphate Academy
              </a>
            </div>
        </div>
        </section>

        {/* Departments Section */}
        <section className="departments-section">
          <h2>Our Vocational Departments</h2>
        <div className="vocational-section">
          {departments.map((dept) => (
            <div className="vocational-card" key={dept.id}>
              <div className="voc-title">{dept.title}</div>
              <div className="voc-desc">{dept.desc}</div>
              <div className="voc-images-grid-2x2">
                  {dept.images?.map((img, i) => (
                  <img src={img} alt={dept.title + ' ' + (i+1)} key={i} className="voc-img-2x2" />
                ))}
              </div>
            </div>
          ))}
        </div>
        </section>

        {/* Fee Structure Section */}
        <section className="fee-structure-section">
          <h2>Fee Structure</h2>
          <button className="download-btn" onClick={handleDownloadPDF}>
            <FaDownload /> Download Fee Structure
          </button>
          <div id="fee-table-container" className="fee-table-container">
            <table className="fee-table">
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Admission Fee</th>
                  <th>Tuition Fee</th>
                  <th>Vocational Fee</th>
                  <th>Sanitation + Health</th>
                  <th>Sport Wear</th>
                  <th>Lab Fee</th>
                  <th>Total Fee</th>
                  <th>Installments</th>
                  <th>Vocational Departments</th>
                </tr>
              </thead>
              <tbody>
                {schoolClasses.map((classItem) => (
                  <tr key={classItem.id}>
                    <td>{classItem.className}</td>
                    <td>{(classItem.admissionFee || 0).toLocaleString()} FCFA</td>
                    <td>{(classItem.tuitionFee || 0).toLocaleString()} FCFA</td>
                    <td>{isSpecialClass(classItem.className) ? 'None' : `${(classItem.vocationalFee || 0).toLocaleString()} FCFA`}</td>
                    <td>{(classItem.sanitationHealthFee || 0).toLocaleString()} FCFA</td>
                    <td>{(classItem.sportWearFee || 0).toLocaleString()} FCFA</td>
                    <td>{isSpecialClass(classItem.className) ? `${(classItem.labFee || 0).toLocaleString()} FCFA` : 'None'}</td>
                    <td>{(classItem.totalFee || 0).toLocaleString()} FCFA</td>
                    <td>{classItem.installments || 1}</td>
                    <td>
                      <div className="about-departments-grid">
                        {isSpecialClass(classItem.className) ? (
                          <div className="about-department-item no-department">
                            None
                          </div>
                        ) : classItem.selectedDepartments?.map((dept, index) => (
                          <div key={index} className="about-department-item">
                            {dept}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
