
import React, { useState, useEffect } from 'react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const scrollToSection = (sectionId: string) => {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth',
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-[1000] py-4 bg-white bg-opacity-95 shadow-sm transition-all duration-300">
      <div className="container flex justify-between items-center">
        <a href="#" className="flex items-center text-decoration-none">
          <h1 className="text-[1.8rem] mb-0">Apo<span className="text-secondary">Lead</span></h1>
        </a>
        <nav>
          <ul className={`flex md:flex ${mobileMenuOpen ? 'flex' : 'hidden md:flex'} ${mobileMenuOpen ? 'flex-col absolute top-16 left-0 w-full bg-white shadow-md p-4' : ''}`}>
            <li className={`${mobileMenuOpen ? 'mb-3' : 'ml-8'}`}>
              <a 
                href="#" 
                onClick={() => scrollToSection('hero')}
                className="text-dark hover:text-primary font-semibold transition-colors duration-300"
              >
                Home
              </a>
            </li>
            <li className={`${mobileMenuOpen ? 'mb-3' : 'ml-8'}`}>
              <a 
                href="#how-it-works" 
                onClick={(e) => {e.preventDefault(); scrollToSection('how-it-works');}}
                className="text-dark hover:text-primary font-semibold transition-colors duration-300"
              >
                How It Works
              </a>
            </li>
            <li className={`${mobileMenuOpen ? 'mb-3' : 'ml-8'}`}>
              <a 
                href="#benefits" 
                onClick={(e) => {e.preventDefault(); scrollToSection('benefits');}}
                className="text-dark hover:text-primary font-semibold transition-colors duration-300"
              >
                Benefits
              </a>
            </li>
            <li className={`${mobileMenuOpen ? 'mb-3' : 'ml-8'}`}>
              <a 
                href="#testimonials" 
                onClick={(e) => {e.preventDefault(); scrollToSection('testimonials');}}
                className="text-dark hover:text-primary font-semibold transition-colors duration-300"
              >
                Testimonials
              </a>
            </li>
            <li className={`${mobileMenuOpen ? 'mb-3' : 'ml-8'}`}>
              <a 
                href="#contact" 
                onClick={(e) => {e.preventDefault(); scrollToSection('contact');}}
                className="text-dark hover:text-primary font-semibold transition-colors duration-300"
              >
                Contact
              </a>
            </li>
          </ul>
          <div className="md:hidden block cursor-pointer" onClick={toggleMobileMenu}>
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
