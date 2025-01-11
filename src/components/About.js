import React from 'react';
import '../styles/About.css';

function About() {
  return (
    <section id="about">
      <h2>About</h2>
      <div className="features">
        <div className="feature">
          <img src="/path/to/fast-icon.png" alt="Fast" />
          <h3>Fast</h3>
          <p>Fast load times and lag free interaction, my highest priority.</p>
        </div>
        <div className="feature">
          <img src="/path/to/responsive-icon.png" alt="Responsive" />
          <h3>Responsive</h3>
          <p>My layouts will work on any device, big or small.</p>
        </div>
        <div className="feature">
          <img src="/path/to/intuitive-icon.png" alt="Intuitive" />
          <h3>Intuitive</h3>
          <p>Strong preference for easy to use, intuitive UX/UI.</p>
        </div>
        <div className="feature">
          <img src="/path/to/dynamic-icon.png" alt="Dynamic" />
          <h3>Dynamic</h3>
          <p>Websites don’t have to be static, I love making pages come to life.</p>
        </div>
      </div>
    </section>
  );
}

export default About;
