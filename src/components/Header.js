import React from 'react';
import '../styles/Header.css';

function Header() {
  return (
    <header>
      <nav className="navbar">
        <ul>
          <li><a href="#hero">Accueil</a></li>
          <li><a href="#about">Compétences</a></li>
          <li><a href="#projects">Projets</a></li>
          <li className="contact-link"><a href="#contact" className="contact-btn">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;