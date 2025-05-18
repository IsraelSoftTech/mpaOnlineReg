import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill, RiArrowRightLine } from 'react-icons/ri';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook, FaYoutube } from 'react-icons/fa';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';
import './About.css';
import logo from '../../assets/logo.png';

const About = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [schoolClasses, setSchoolClasses] = useState([]);
  const [displayText, setDisplayText] = useState('');
  const [allImages, setAllImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const fullText = 'Welcome to MPASAT';

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

  // Fetch departments and classes
  useEffect(() => {
    const departmentsRef = ref(database, 'departments');
    const classesRef = ref(database, 'schoolClasses');

    const unsubscribeDepts = onValue(departmentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const deptList = Object.entries(data).map(([id, dept]) => ({
          id,
          ...dept
        }));
        setDepartments(deptList);
      }
    });

    const unsubscribeClasses = onValue(classesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const classList = Object.entries(data).map(([id, classData]) => ({
          id,
          ...classData
        }));
        setSchoolClasses(classList);
      }
    });

    return () => {
      unsubscribeDepts();
      unsubscribeClasses();
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="page-wrapper">
      <header className="header-about">
        <div className="logo"><img src={logo} alt=""/></div>
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
          <div className="fee-table-container">
            <table className="fee-table">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Class Name</th>
                  <th>Admission Fee</th>
                  <th>Tuition Fee</th>
                  <th>Vocational Fee</th>
                  <th>Sanitation + Health</th>
                  <th>Sport Wear</th>
                  <th>Total Fee</th>
                  <th>Installments</th>
                  <th>Vocational Departments</th>
                </tr>
              </thead>
              <tbody>
                {schoolClasses.map((classItem, index) => (
                  <tr key={classItem.id}>
                    <td>{index + 1}</td>
                    <td>{classItem.className}</td>
                    <td className="fee-amount">{(classItem.admissionFee || 0).toLocaleString()} FCFA</td>
                    <td className="fee-amount">{(classItem.tuitionFee || 0).toLocaleString()} FCFA</td>
                    <td className="fee-amount">{(classItem.vocationalFee || 0).toLocaleString()} FCFA</td>
                    <td className="fee-amount">{(classItem.sanitationHealthFee || 0).toLocaleString()} FCFA</td>
                    <td>{(classItem.sportWearFee || 0).toLocaleString()} FCFA</td>
                    <td className="fee-amount total-fee">{(classItem.totalFee || 0).toLocaleString()} FCFA</td>
                    <td>{classItem.installments || 1}</td>
                    <td className="departments-cell">
                      <div className="about-departments-grid">
                        {classItem.selectedDepartments?.map((dept, index) => (
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
