
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always navigate to home page, even if logout had issues
      navigate('/', { replace: true });
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-[1000] py-4 bg-white bg-opacity-95 shadow-sm transition-all duration-300">
      <div className="container flex justify-between items-center">
        <Link to="/" className="flex items-center text-decoration-none">
          <h1 className="text-[1.8rem] mb-0">
            <span className="text-[#00c2cb]">Apo</span>
            <span className="text-indigo-600">Lead</span>
          </h1>
        </Link>
        <nav className="flex items-center">
          <ul className={`flex md:flex ${mobileMenuOpen ? 'flex' : 'hidden md:flex'} ${mobileMenuOpen ? 'flex-col absolute top-16 left-0 w-full bg-white shadow-md p-4' : ''}`}>
            <li className={`${mobileMenuOpen ? 'mb-3' : 'ml-8'}`}>
              <Link 
                to="/"
                className="text-dark hover:text-primary font-semibold transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li className={`${mobileMenuOpen ? 'mb-3' : 'ml-8'}`}>
              <Link 
                to="/agents"
                className="text-dark hover:text-primary font-semibold transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Agents
              </Link>
            </li>
            <li className={`${mobileMenuOpen ? 'mb-3' : 'ml-8'}`}>
              <Link 
                to="/partners"
                className="text-dark hover:text-primary font-semibold transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Partners
              </Link>
            </li>
            <li className={`${mobileMenuOpen ? 'mb-3' : 'ml-8'}`}>
              <Link 
                to="/contact"
                className="text-dark hover:text-primary font-semibold transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </li>
          </ul>
          
          {/* Login/Logout Button */}
          {user ? (
            <a 
              href="#" 
              onClick={handleLogout}
              className="ml-8 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Logout
            </a>
          ) : (
            <Link 
              to="/login" 
              className="ml-8 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Login
            </Link>
          )}
          
          <div className="md:hidden block cursor-pointer ml-4" onClick={toggleMobileMenu}>
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
