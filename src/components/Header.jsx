import React, { useState } from 'react';
import { Link } from 'react-scroll';
import '../styles/Header.css';
import logo from '../images/logo.png';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header>
      <nav className="navbar">
        <div className="logo">
          <Link to="hero" className="logo-link" smooth={true} duration={500} onClick={closeMenu}>
            <img src={logo} alt="Logo" />
          </Link>
        </div>
        <div className="navbar-toggle" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
        <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <Link to="hero" smooth={true} duration={500} onClick={closeMenu}>
              Accueil
            </Link>
          </li>
          <li>
            <Link to="about" smooth={true} duration={500} onClick={closeMenu}>
              A Propos
            </Link>
          </li>
          <li>
            <Link to="projects" smooth={true} duration={500} onClick={closeMenu}>
              Projets
            </Link>
          </li>
          <li className="contact-link">
            <Link to="contact" smooth={true} duration={500} className="contact-btn" onClick={closeMenu}>
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;