import React from 'react';
import Home from '../pages/Home';
import About from '../pages/About';
import Resume from '../pages/Resume';
import Projects from '../pages/Projects';
import Contact from '../pages/Contact';
import Utf from '../pages/Utf';

const MobilePages = () => {
  return (
    <div className="mobile-singlepage" role="main">
      <section id="home" className="mobile-section"><Home /></section>
      <section id="about" className="mobile-section"><About /></section>
      <section id="resume" className="mobile-section"><Resume /></section>
      <section id="projects" className="mobile-section"><Projects /></section>
      <section id="contact" className="mobile-section"><Contact /></section>
      <section id="utf" className="mobile-section"><Utf /></section>
    </div>
  );
};

export default MobilePages;