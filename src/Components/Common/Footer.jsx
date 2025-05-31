import React from 'react';
import { FaFacebook, FaYoutube, FaTiktok } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="mpasat-footer">
      <div className="mpasat-footer-content">
        <div className="mpasat-footer-title">
          Mpasat Admission Portal
        </div>
        <div className="mpasat-social-links">
          <a href="https://www.fb.com/l/6lp1kJRRR" target="_blank" rel="noopener noreferrer" className="mpasat-social-link">
            <FaFacebook className="mpasat-social-icon" />
            <span>Facebook</span>
          </a>
          <a href="https://youtube.com/@mbakwaphosphateacademy3992" target="_blank" rel="noopener noreferrer" className="mpasat-social-link">
            <FaYoutube className="mpasat-social-icon" />
            <span>YouTube</span>
          </a>
          <a href="https://www.tiktok.com/@mpasat237" target="_blank" rel="noopener noreferrer" className="mpasat-social-link">
            <FaTiktok className="mpasat-social-icon" />
            <span>TikTok</span>
          </a>
        </div>
        <div className="mpasat-copyright">
          All Rights Reserved, 2025
        </div>
      </div>
    </footer>
  );
};

export default Footer; 