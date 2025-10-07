import React, { useEffect, useState } from "react";
import { Link } from "react-scroll";
import logo from "../images/logo.png";
import "../styles/Header.css";

function Header() {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  // Fermer avec la touche Échap
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Empêcher le scroll quand le menu est ouvert
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="nav-header">
      <nav className="navbar" role="navigation" aria-label="Navigation principale">
        <div className="brand">
          <Link
            to="hero"
            className="logo-link"
            smooth={true}
            duration={500}
            onClick={close}
            aria-label="Aller à l'accueil"
          >
            <img src={logo} alt="Logo" className="logo" />
          </Link>
        </div>

        {/* Bouton burger */}
        <button
          className={`burger ${open ? "active" : ""}`}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          aria-controls="primary-menu"
          onClick={toggle}
        >
          <span className="line" />
          <span className="line" />
          <span className="line" />
        </button>

        {/* Liens de navigation */}
        <ul id="primary-menu" className={`menu ${open ? "open" : ""}`}>
          <li>
            <Link to="hero" smooth duration={500} onClick={close}>
              Accueil
            </Link>
          </li>
          <li>
            <Link to="about" smooth duration={500} onClick={close}>
              A Propos
            </Link>
          </li>
          <li>
            <Link to="projects" smooth duration={500} onClick={close}>
              Projets
            </Link>
          </li>
          <li>
            <Link
              to="contact"
              smooth
              duration={500}
              onClick={close}
              className="btn"
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>

      {/* Overlay pour mobile */}
      <div className={`overlay ${open ? "show" : ""}`} onClick={close} />
    </header>
  );
}

export default Header;