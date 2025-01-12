import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import './App.css';

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });
  }, []);

  return (
    <div className="App">
      <Header />
      <Hero />
      <section data-aos="fade-up">
        <About />
      </section>
      <section data-aos="fade-up">
        <Projects />
      </section>
      <section data-aos="fade-up">
        <Contact />
      </section>
      <Footer />
    </div>
  );
}

export default App;