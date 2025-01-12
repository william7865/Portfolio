import React from 'react';
import '../styles/Projects.css';
import restaurantImg from '../images/restaurant.png';
import ecommerceImg from '../images/ecommerce.png';
import matchfitImg from '../images/matchfit.png';

function Projects() {
  const projects = [
    {
      title: 'Site E-Commerce',
      description: "Développement d'un site e-commerce dynamique avec un catalogue de produits, une gestion du panier, ainsi que des options de connexion et d’inscription utilisateur, le tout soutenu par une base de données pour stocker et gérer les informations. L’interface est conçue pour offrir une expérience utilisateur fluide et intuitive.",
      image: ecommerceImg,
      tags: ['PHP', 'MySQL'],
      link: 'https://github.com/william7865/E_commerce',
      reverse: true
    },
    {
      title: 'MatchFit - Application Web de Coaching',
      description: "MatchFit est une application web permettant la mise en relation entre des coachs et des élèves. Les utilisateurs peuvent créer un compte, consulter des suggestions en fonction de leur sport préféré, et lire des avis sur les coachs. Le site propose des profils détaillés pour les coachs, incluant des vidéos et des descriptions, ainsi que des profils pour les utilisateurs avec leurs informations. Il inclut également une fonctionnalité indiquant l'état d'activité des coachs.",
      image: matchfitImg,
      tags: ['Vue.js', 'PHP', 'PostgreSQL', 'Docker'],
      link: 'https://github.com/william7865/MatchFit',
      reverse: false
    },
    {
      title: 'Site Web Restaurant',
      description: 'Le projet a été réalisé pour les clients d’Arcsolu dans le secteur de la restauration. Il s’agit d’un site web générique et réutilisable, conçu comme une page unique (SPA) regroupant les informations essentielles. Le site intègre également une fonctionnalité multilingue avec neuf langues, offrant une solution flexible et adaptée aux besoins variés des restaurants',
      image: restaurantImg,
      tags: ['React.js', 'Figma'],
      link: '#',
      reverse: true
    },
  ];

  return (
    <section id="projects" className="projects-section">
      <div className="projects-content">
        <h2>Un aperçu de mes projets, où technologie et innovation se rencontrent</h2>
        <div className="projects-list">
          {projects.map((project, index) => (
            <div key={index} className="project-card">
              {project.reverse ? (
                <>
                  <div className="project-info">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="tags">
                      {project.tags.map((tag, index) => (
                        <div key={index} className="tag">{tag}</div>
                      ))}
                    </div>
                    <a href={project.link} className="project-link" target="_blank" rel="noopener noreferrer">
                      Voir le projet
                    </a>
                  </div>
                  <div className="project-image">
                    <img src={project.image} alt={project.title} />
                  </div>
                </>
              ) : (
                <>
                  <div className="project-image">
                    <img src={project.image} alt={project.title} />
                  </div>
                  <div className="project-info">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="tags">
                      {project.tags.map((tag, index) => (
                        <div key={index} className="tag">{tag}</div>
                      ))}
                    </div>
                    <a href={project.link} className="project-link" target="_blank" rel="noopener noreferrer">
                      Voir le projet
                    </a>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;