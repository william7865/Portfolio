import React from 'react';
import '../styles/Hero.css';
import profil from '../images/profil.jpg';
import { FaLinkedin, FaEnvelope } from 'react-icons/fa';

function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-content">
        <div className="profile-picture">
          <img src={profil} alt="Photo de William Lin" />
        </div>
        <div className="hero-text">
          <h1>
            <span>William Lin</span>
          </h1>
          <p>
            "La programmation n’est pas seulement un métier, c’est une manière de résoudre des problèmes et d’apporter des solutions créatives."
          </p>
          <a href="#contact" className="hire-btn">Contactez-moi !</a>
        </div>
      </div>
      <div className="hero-links">
        <a href="https://www.linkedin.com/in/william-lin-623165295/" target="_blank" rel="noopener noreferrer">
          <FaLinkedin />
        </a>
        <a href="mailto:linwilliam14@gmail.com">
          <FaEnvelope />
        </a>
      </div>
    </section>
  );
}

export default Hero;