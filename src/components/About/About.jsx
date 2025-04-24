import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';
import logo from '../../assets/logo.png';
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa';

// Department data
const departments = [
  {
    title: 'Chemical Engineering',
    description: 'Turning chemical equations into products. More than 50 household products relased to students and trainees. Examples of products include: Vaseline,balm,liquid detergents, powdered detergents, laundry soap, body lotion etc',
    image: 'https://www.alshoumoukh.com/images/products-services/chemicals/production-chemicals/production-chemicals-1.jpg'
  },
  {
    title: 'Academics',
    description: 'We offer a comprehensive academic program with experienced faculty, modern teaching methods, and state-of-the-art learning facilities.',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    title: 'Sports',
    description: 'Our sports department promotes physical fitness and team spirit through various sports activities and well-maintained sports facilities.',
    image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    title: 'Library',
    description: 'A vast collection of books, digital resources, and quiet study spaces to support academic excellence and research.',
    image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    title: 'Cafeteria',
    description: 'Healthy and delicious meals prepared in a hygienic environment, offering a variety of options to suit all dietary needs.',
    image: 'https://images.unsplash.com/photo-1517248135467-4cbeed01d77b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    title: 'Health Center',
    description: 'Professional medical care and wellness services available to all students, ensuring their health and well-being.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    title: 'Transportation',
    description: 'Safe and reliable transportation services for students, with well-maintained vehicles and professional drivers.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    title: 'Career Services',
    description: 'Comprehensive career guidance, internship opportunities, and job placement assistance for students.',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    title: 'Student Activities',
    description: 'A vibrant student life with various clubs, organizations, and events to enhance the overall college experience.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    title: 'Technology',
    description: 'Modern computer labs, high-speed internet, and technical support to facilitate digital learning and research.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  }
];

const About = () => {
  return (
    <div className="about-container">
      <nav className="navbar">
        <Link to="/" className="logo">
          <img src={logo} alt="logo" />
        </Link>
        <div className="nav-links">
          <Link to="/about" className="active">About Us</Link>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Sign Up</Link>
        </div>
      </nav>
      <div className="about-header">
          <h1>Our Departments</h1>
          <p>Explore the various departments that make our institution unique</p>
        </div>
      <main className="main-content">
      

        <div className="departments-container">
          {departments.map((department, index) => (
            <div key={index} className="department-card">
              <div className="department-content">
                <h2>{department.title}</h2>
                <p>{department.description}</p>
              </div>
              <div className="department-image">
                <img src={department.image} alt={department.title} />
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">M P A S A T</div>
          <div className="footer-text">All Rights Reserved - 2025</div>
          <div className="social-links">
            <span>Follow us on:</span>
            <div className="social-icons">
              <a href="#instagram"><FaInstagram/></a>
              <a href="#facebook"><FaFacebookF/></a>
              <a href="#tiktok"><FaTiktok/></a>
              <a href="#youtube"><FaYoutube/></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About; 