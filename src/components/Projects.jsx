import React from 'react';
import '../styles/Projects.css';
import restaurantImg from '../images/restaurant.png';
import ecommerceImg from '../images/ecommerce.png';
import matchfitImg from '../images/matchfit.png';
import { FiExternalLink, FiGithub } from 'react-icons/fi';

function Projects() {
  const projects = [
    {
      title: 'MatchFit — Application Web de Coaching',
      year: '2024',
      role: 'Full Stack',
      description:
        "Plateforme de mise en relation coachs/élèves : authentification, profils dédiés, avis & notation, suggestions par sport, recherche/filtrage, interface responsive. Docker pour le dev et CI avec GitHub Actions.",
      image: matchfitImg,
      tags: ['Vue.js', 'JavaScript', 'PHP', 'PostgreSQL', 'Docker', 'GitHub Actions'],
      repo: 'https://github.com/william7865/MatchFit',
      demo: null
    },
    {
      title: 'Site E-Commerce',
      year: '2024',
      role: 'Back/Front',
      description:
        "Catalogue produits, CRUD, catégories, pagination, gestion de panier, espace admin sécurisé, requêtes SQL préparées, base MySQL. Interface pensée pour rester fluide et claire.",
      image: ecommerceImg,
      tags: ['PHP', 'MySQL'],
      repo: 'https://github.com/william7865/E_commerce',
      demo: null
    },
    {
      title: 'Site Web Restaurant (SPA réutilisable)',
      year: '2024',
      role: 'Front',
      description:
        "Template destiné aux clients d’Arcsolu (restauration) : single-page app, sections essentielles, responsive, mode multilingue (9 langues), base design réalisée sur Figma.",
      image: restaurantImg,
      tags: ['React.js', 'Figma', 'i18n'],
      repo: null,
      demo: '#'
    }
  ];

  return (
    <section id="projects" className="projects-section">
      <div className="projects-content">
        <h2>Un aperçu de mes projets</h2>
        <div className="projects-list">
          {projects.map((project, index) => {
            const isReversed = index % 2 === 1;
            return (
              <article key={project.title} className={`project-card ${isReversed ? 'reverse' : ''}`}>
                <div className="project-image">
                  <img src={project.image} alt={project.title} loading="lazy" />
                </div>

                <div className="project-info">
                  <div className="project-meta">
                    <span className="badge">{project.year}</span>
                    <span className="badge badge-muted">{project.role}</span>
                  </div>

                  <h3>{project.title}</h3>
                  <p>{project.description}</p>

                  <div className="tags" aria-label="Technologies utilisées">
                    {project.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>

                  <div className="project-actions">
                    {project.repo && (
                      <a
                        href={project.repo}
                        className="btn"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Voir le code source de ${project.title}`}
                      >
                        <FiGithub className="btn-ic" /> Code
                      </a>
                    )}
                    {project.demo ? (
                      <a
                        href={project.demo}
                        className="btn btn-secondary"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Voir la démo de ${project.title}`}
                      >
                        <FiExternalLink className="btn-ic" /> Démo
                      </a>
                    ) : (
                      <button className="btn btn-secondary" disabled title="Démo indisponible">
                        <FiExternalLink className="btn-ic" /> Démo
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Projects;