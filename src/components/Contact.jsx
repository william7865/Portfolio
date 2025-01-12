import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import '../styles/Contact.css';

const Contact = () => {
    return (
        <section id="contact" className="contact-section">
            <div className="container">
                <div className="contact-text">
                    <h2>DISCUTONS ENSEMBLE DE VOTRE PROJET</h2>
                    <p>
                        Je suis actuellement à la recherche d'une alternance dans le domaine du développement web ou de la conception de dispositifs interactifs. Disponible à partir de septembre 2025, je recherche un rythme d'alternance de 2 semaines en entreprise et 1 semaine de cours. N'hésitez pas à me contacter pour échanger sur la manière dont je pourrais apporter de la valeur à votre entreprise.
                    </p>
                </div>

                <div className="social-links">
                    <a href="https://github.com/william7865" target="_blank" rel="noopener noreferrer" className="social-link">
                        <FaGithub />
                        <span className="social-text">Mon GitHub pour voir mes projets</span>
                    </a>
                    <a href="https://www.linkedin.com/in/william-lin-623165295/" target="_blank" rel="noopener noreferrer" className="social-link">
                        <FaLinkedin />
                        <span className="social-text">Connectons-nous sur LinkedIn</span>
                    </a>
                    <a href="mailto:linwilliam14@gmail.com" className="social-link">
                        <FaEnvelope />
                        <span className="social-text">Envoyez-moi un email</span>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Contact;