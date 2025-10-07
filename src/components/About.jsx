import React from 'react';
import '../styles/About.css';
import dev from '../images/dev.jpeg';
import {
  FaHtml5, FaCss3Alt, FaJs, FaReact, FaNodeJs, FaPhp, FaDocker, FaGithub, FaVuejs, FaPython
} from 'react-icons/fa';
import {
  SiMysql, SiPostgresql, SiSymfony, SiFigma, SiTypescript, SiMariadb, SiMongodb, SiDotnet
} from 'react-icons/si';
import { TbBrandCSharp } from 'react-icons/tb';

function About() {
  const skills = [
    // === Frontend ===
    { name: 'HTML',        icon: <FaHtml5 />,     category: 'Frontend', color: '#E34F26' },
    { name: 'CSS',         icon: <FaCss3Alt />,   category: 'Frontend', color: '#1572B6' },
    { name: 'JavaScript',  icon: <FaJs />,        category: 'Frontend', color: '#F7DF1E' },
    { name: 'TypeScript',  icon: <SiTypescript />,category: 'Frontend', color: '#3178C6' },
    { name: 'React.js',    icon: <FaReact />,     category: 'Frontend', color: '#61DAFB' },
    { name: 'Vue.js',      icon: <FaVuejs />,     category: 'Frontend', color: '#4FC08D' },

    // === Backend === 
    { name: '.NET', icon: <SiDotnet />,     category: 'Backend',  color: '#512BD4' },
    { name: 'C#',   icon: <TbBrandCSharp />,category: 'Backend',  color: '#239120' },
    { name: 'Node.js', icon: <FaNodeJs />,  category: 'Backend',  color: '#339933' },
    { name: 'PHP',  icon: <FaPhp />,        category: 'Backend',  color: '#777BB4' },
    { name: 'Symfony', icon: <SiSymfony />, category: 'Backend',  color: '#000000' },
    { name: 'Python',  icon: <FaPython />,  category: 'Backend',  color: '#3776AB' },

    // === Database ===
    { name: 'MariaDB',    icon: <SiMariadb />,    category: 'Database', color: '#003545' },
    { name: 'MongoDB',    icon: <SiMongodb />,    category: 'Database', color: '#47A248' },
    { name: 'MySQL',      icon: <SiMysql />,      category: 'Database', color: '#4479A1' },
    { name: 'PostgreSQL', icon: <SiPostgresql />, category: 'Database', color: '#336791' },

    // === Tools ===
    { name: 'Docker',     icon: <FaDocker />,     category: 'Tools',    color: '#2496ED' },
    { name: 'Git/GitHub', icon: <FaGithub />,     category: 'Tools',    color: '#181717' },
    { name: 'Figma (UX/UI)', icon: <SiFigma />,   category: 'Tools',    color: '#F24E1E' }
  ];

  const categories = ['Frontend', 'Backend', 'Database', 'Tools'];

  return (
    <section id="about" className="about-section">
      <div className="about-content">
        <div className="about-text">
          <h2>À PROPOS DE MOI</h2>
          <p>
            Moi c’est <strong>William Lin</strong>, étudiant en <strong>Bachelor Développement Web &amp; Application (Efrei, 2023–2026)</strong>. 
            Mon objectif est de devenir <strong>Développeur Full&nbsp;Stack</strong> et de maîtriser aussi bien le Front-end que le Back-end.
          </p>
          <p>
            Je suis orienté <strong>code</strong>, avec un goût prononcé pour les bonnes pratiques, 
            l’optimisation et la qualité logicielle. <strong>Curieux</strong> et <strong>rigoureux</strong>, 
            j’aime résoudre des problèmes concrets et améliorer mes compétences en continu.
          </p>

          {/* Disponible en alternance avec un point lumineux */}
          <div className="availability">
            <span className="dot"></span>
            <span>Disponible en <strong>Alternance</strong></span>
          </div>

          <div style={{ marginTop: '20px' }}>
            <a href="./CV.pdf" className="cv-button" target="_blank" rel="noopener noreferrer">
              Voir mon CV
            </a>
            <a href="mailto:linwilliam14@gmail.com" className="cv-button" style={{ marginLeft: '15px' }}>
              Me contacter
            </a>
          </div>
        </div>

        <div className="about-image">
          <img src={dev} alt="William Lin" />
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
