
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const scrollToSection = (sectionId: string) => {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth',
      });
    }
  };

  return (
    <footer id="contact" className="bg-[#1a1a2e] text-white pt-16 pb-8">
      <div className="container">
        <div className="flex flex-wrap justify-between mb-12">
          <div className="w-full md:w-1/2 lg:w-1/4 mb-8">
            <div className="mb-6">
              <h2 className="text-2xl inline">Apo<span className="text-secondary">Lead</span></h2>
            </div>
            <p className="max-w-[300px] text-base text-gray-300 mb-6">
              ApoLead is a global leader in remote call center solutions, connecting talented individuals with flexible work opportunities.
            </p>
            <div className="flex">
              <a href="#" className="social-link bg-white bg-opacity-10">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social-link bg-white bg-opacity-10">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-link bg-white bg-opacity-10">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="social-link bg-white bg-opacity-10">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 lg:w-1/5 mb-8">
            <h3 className="text-xl mb-6 pb-3 relative">
              Quick Links
              <span className="absolute bottom-0 left-0 w-[50px] h-0.5 bg-secondary"></span>
            </h3>
            <ul className="list-none">
              <li className="mb-3">
                <a 
                  href="#" 
                  onClick={() => scrollToSection('hero')}
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Home
                </a>
              </li>
              <li className="mb-3">
                <a 
                  href="#how-it-works" 
                  onClick={(e) => {e.preventDefault(); scrollToSection('how-it-works');}} 
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  How It Works
                </a>
              </li>
              <li className="mb-3">
                <a 
                  href="#benefits" 
                  onClick={(e) => {e.preventDefault(); scrollToSection('benefits');}} 
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Benefits
                </a>
              </li>
              <li className="mb-3">
                <a 
                  href="#testimonials" 
                  onClick={(e) => {e.preventDefault(); scrollToSection('testimonials');}} 
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Testimonials
                </a>
              </li>
              <li className="mb-3">
                <Link 
                  to="/signup" 
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Apply Now
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="w-full md:w-1/2 lg:w-1/5 mb-8">
            <h3 className="text-xl mb-6 pb-3 relative">
              Resources
              <span className="absolute bottom-0 left-0 w-[50px] h-0.5 bg-secondary"></span>
            </h3>
            <ul className="list-none">
              <li className="mb-3"><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Agent Resources</a></li>
              <li className="mb-3"><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Training Portal</a></li>
              <li className="mb-3"><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">FAQ</a></li>
              <li className="mb-3"><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Blog</a></li>
              <li className="mb-3"><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Success Stories</a></li>
            </ul>
          </div>
          
          <div className="w-full md:w-1/2 lg:w-1/5 mb-8">
            <h3 className="text-xl mb-6 pb-3 relative">
              Contact Us
              <span className="absolute bottom-0 left-0 w-[50px] h-0.5 bg-secondary"></span>
            </h3>
            <ul className="list-none">
              <li className="mb-3 flex items-center">
                <i className="fas fa-envelope mr-2"></i> 
                <a href="mailto:careers@apolead.com" className="text-gray-300 hover:text-white transition-colors duration-300">careers@apolead.com</a>
              </li>
              <li className="mb-3 flex items-center">
                <i className="fas fa-phone mr-2"></i> 
                <a href="tel:+18001234567" className="text-gray-300 hover:text-white transition-colors duration-300">+1 (800) 123-4567</a>
              </li>
              <li className="mb-3 flex items-center">
                <i className="fas fa-globe mr-2"></i> 
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">www.apolead.com</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white border-opacity-10 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} ApoLead. All Rights Reserved. | 
            <Link to="/privacy-policy" className="hover:text-white ml-1 mr-1">Privacy Policy</Link> | 
            <Link to="/terms-of-service" className="hover:text-white ml-1">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
