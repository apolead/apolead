
import React from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const Hero = () => {
  const isMobile = useIsMobile();

  return (
    <section id="hero" className="pt-32 pb-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/agent_signup.jpg')] bg-cover bg-center blur-md opacity-10"></div>
      <div className="container relative z-[2] flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 md:pr-8 mb-12 md:mb-0 animate-fadeInUp">
          <h1 className={`mb-4 ${isMobile ? 'text-3xl' : ''}`}>Your Time. Your Schedule. <span className="text-primary">Your Career.</span></h1>
          <p className="mb-6">Join ApoLead - the premier remote call center platform where you can work from anywhere in the world, on your own schedule. Turn your communication skills into a flexible career with unlimited earning potential.</p>
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
          <div className="md:w-1/2 animate-fadeInUp animate-fadeInUp-delay-2">
            <div className="animate-floating">
              <img src="/agent_signup.jpg" alt="Agent Sign Up" className="max-w-full rounded-lg shadow-xl" />
            </div>
          </div>
        )}
      </div>
      
      {/* Login button in top right */}
      <div className="absolute top-4 right-8 z-10">
        <Link 
          to="/login" 
          className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md shadow-sm font-medium transition-colors"
        >
          Log In
        </Link>
      </div>
    </section>
  );
};

export default Hero;
