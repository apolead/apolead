
import React from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const Hero = () => {
  const isMobile = useIsMobile();

  return (
    <section id="hero" className="pt-32 pb-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/agent.jpg')] bg-cover bg-center blur-sm opacity-20"></div>
      <div className="container relative z-[2] flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 md:pr-8 mb-12 md:mb-0">
          <h1 className={`mb-4 text-dark ${isMobile ? 'text-3xl' : ''}`}>Your Time. Your Schedule. <span className="text-primary">Your Career.</span></h1>
          <p className="mb-6 text-dark">Join ApoLead - the premier remote call center platform where you can work from anywhere in the world, on your own schedule. Turn your communication skills into a flexible career with unlimited earning potential.</p>
          <Link to="/signup" className="btn btn-primary btn-large mb-16">Start Your Journey →</Link>
          
          <div className="flex flex-wrap mt-8">
            <div className="mr-8 mb-4">
              <div className="text-4xl font-bold text-primary">32+</div>
              <div className="text-sm text-gray">Countries Represented</div>
            </div>
            <div className="mr-8 mb-4">
              <div className="text-4xl font-bold text-primary">100%</div>
              <div className="text-sm text-gray">Remote Work</div>
            </div>
            <div className="mr-8 mb-4">
              <div className="text-4xl font-bold text-primary">$$$</div>
              <div className="text-sm text-gray">Profit Sharing for Top Performers</div>
            </div>
          </div>
        </div>
        {!isMobile && (
          <div className="md:w-1/2">
            <div>
              <img src="/agent.jpg" alt="Agent" className="max-w-full rounded-lg shadow-xl" />
            </div>
          </div>
        )}
      </div>
      
      {/* Login button in top right */}
      <div className="absolute top-4 right-8 z-10">
        <Link 
          to="/login" 
          className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md shadow-sm font-medium transition-colors"
        >
          Log In
        </Link>
      </div>
    </section>
  );
};

export default Hero;
