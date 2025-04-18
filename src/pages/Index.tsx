import React, { useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Benefits from '../components/Benefits';
import Stats from '../components/Stats';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import WaitlistBanner from '../components/WaitlistBanner';

const FontAwesomeScript = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

const Index = () => {
  useEffect(() => {
    const animateOnScroll = () => {
      const elements = document.querySelectorAll('.animate-fadeInUp');
      
      elements.forEach(element => {
        const position = element.getBoundingClientRect();
        if (position.top < window.innerHeight - 50) {
          element.classList.add('opacity-100');
        }
      });
    };

    document.querySelectorAll('.animate-fadeInUp').forEach(element => {
      element.classList.add('opacity-0');
    });

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();

    return () => window.removeEventListener('scroll', animateOnScroll);
  }, []);

  const isWaitlistEnabled = true;

  return (
    <div className="overflow-x-hidden">
      <FontAwesomeScript />
      <div className="flex flex-col">
        {isWaitlistEnabled && <WaitlistBanner />}
        <Header />
        <Hero />
        <Features />
        <HowItWorks />
        <Benefits />
        <Stats />
        <Testimonials />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
