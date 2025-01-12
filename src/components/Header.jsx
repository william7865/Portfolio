import React, { useState } from 'react';
import '../styles/Header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header>
      <nav className="navbar">
        <div className="navbar-toggle" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
        <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <li><a href="#hero">Accueil</a></li>
          <li><a href="#about">A Propos</a></li>
          <li><a href="#projects">Projets</a></li>
          <li className="contact-link"><a href="#contact" className="contact-btn">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;