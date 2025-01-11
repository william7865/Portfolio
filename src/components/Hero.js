import React from 'react';
import '../styles/Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="profile-picture">
          <img src="ton-image.jpg" alt="Photo de William Lin" />
        </div>
        <div className="hero-text">
          <h1>
            Hi, I’m <br /> <span>William Lin</span>
          </h1>
          <p>
            A freelance <span>Full Stack Developer</span> with a passion for creating modern and performant web solutions.
          </p>
          <button className="hire-btn">Hire me!</button>
        </div>
      </div>
    </section>
  );
}

export default Hero;