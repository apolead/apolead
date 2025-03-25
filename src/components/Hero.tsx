
import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section id="hero" className="pt-32 pb-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/api/placeholder/1200/600')] bg-cover bg-center blur-md opacity-10"></div>
      <div className="container relative z-[2] flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 md:pr-8 mb-12 md:mb-0 animate-fadeInUp">
          <h1 className="mb-4">Your Time. Your Schedule. <span className="text-primary">Your Career.</span></h1>
          <p className="mb-6">Join ApoLead - the premier remote call center platform where you can work from anywhere in the world, on your own schedule. Turn your communication skills into a flexible career with unlimited earning potential.</p>
          <Link to="/login" className="btn btn-primary btn-large mb-16">Start Your Journey →</Link>
          
          <div className="flex flex-wrap mt-8">
            <div className="mr-8 mb-4">
              <div className="text-4xl font-bold text-primary">10,000+</div>
              <div className="text-sm text-gray">Remote Agents Worldwide</div>
            </div>
            <div className="mr-8 mb-4">
              <div className="text-4xl font-bold text-primary">100%</div>
              <div className="text-sm text-gray">Remote Work</div>
            </div>
            <div className="mr-8 mb-4">
              <div className="text-4xl font-bold text-primary">$25/hr</div>
              <div className="text-sm text-gray">Average Earnings</div>
            </div>
          </div>
        </div>
        <div className="md:w-1/2 animate-fadeInUp animate-fadeInUp-delay-2">
          <div className="animate-floating">
            <img src="/api/placeholder/600/400" alt="Call Center Agents Working Remotely" className="max-w-full rounded-lg shadow-xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
