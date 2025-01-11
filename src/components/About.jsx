import React from 'react';
import '../styles/About.css';
import dev from '../images/dev.jpeg';
import { FaHtml5, FaCss3Alt, FaJs, FaReact, FaNodeJs, FaPhp, FaDocker, FaGithub } from 'react-icons/fa';
import { SiMysql, SiPostgresql, SiSymfony, SiFigma } from 'react-icons/si';

function About() {
  const skills = [
    { name: 'HTML', icon: <FaHtml5 />, category: 'Frontend', color: '#E34F26' },
    { name: 'CSS', icon: <FaCss3Alt />, category: 'Frontend', color: '#1572B6' },
    { name: 'JavaScript', icon: <FaJs />, category: 'Frontend', color: '#F7DF1E' },
    { name: 'ReactJs', icon: <FaReact />, category: 'Frontend', color: '#61DAFB' },
    { name: 'NodeJS', icon: <FaNodeJs />, category: 'Backend', color: '#339933' },
    { name: 'PHP', icon: <FaPhp />, category: 'Backend', color: '#777BB4' },
    { name: 'MySql', icon: <SiMysql />, category: 'Database', color: '#4479A1' },
    { name: 'Symfony', icon: <SiSymfony />, category: 'Backend', color: '#000000' },
    { name: 'Postgresql', icon: <SiPostgresql />, category: 'Database', color: '#336791' },
    { name: 'Docker', icon: <FaDocker />, category: 'Tools', color: '#2496ED' }, 
    { name: 'Figma', icon: <SiFigma />, category: 'Tools', color: '#F24E1E' },
    { name: 'Git/Github', icon: <FaGithub />, category: 'Tools', color: '#181717' }
  ];

  const categories = ['Frontend', 'Backend', 'Database', 'Tools'];

  return (
    <section id="about" className="about-section">
      <div className="about-content">
        <div className="about-text">
          <h2>À PROPOS DE MOI</h2>
          <p>
            Moi c'est <strong>William</strong>, un développeur passionné par le <strong>design </strong> 
            et le <strong>développement web</strong>. J'aime concevoir des solutions innovantes et 
            efficaces, en intégrant des technologies modernes pour répondre aux besoins des utilisateurs.
          </p>
          <p>
            Je suis <strong>curieux</strong> et <strong>rigoureux</strong>. J’aime accepter des défis lors de mes formations.
          </p>
          <a href="ton-cv.pdf" className="cv-button" target="_blank" rel="noopener noreferrer">
            Voir mon CV
          </a>
        </div>
        <div className="about-image">
          <img src={dev} alt="William" />
        </div>
      </div>

      <div className="skills-section">
        <h2>Compétences</h2>
        <div className="skills-container">
          {categories.map((category, index) => (
            <div key={index} className="skills-category">
              <h3>{category}</h3>
              <div className="skills-list">
                {skills.filter(skill => skill.category === category).map((skill, index) => (
                  <div key={index} className="skill-card">
                    <div className="icon" style={{ color: skill.color }}>
                      {skill.icon}
                    </div>
                    <h4>{skill.name}</h4>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;