
import React from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const Hero = () => {
  const isMobile = useIsMobile();

  return (
    <section id="hero" className="pt-32 pb-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/api/placeholder/1200/600')] bg-cover bg-center blur-md opacity-10"></div>
      <div className="container relative z-[2] flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 md:pr-8 mb-12 md:mb-0 animate-fadeInUp">
          <h1 className={`mb-4 ${isMobile ? 'text-3xl' : ''}`}>Your Time. Your Schedule. <span className="text-primary">Your Career.</span></h1>
          <p className="mb-6">Join ApoLead - the premier remote call center platform where you can work from anywhere in the world, on your own schedule. Turn your communication skills into a flexible career with unlimited earning potential.</p>
          <Link to="/login" className="btn btn-primary btn-large mb-16">Start Your Journey →</Link>
          
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
              <img src="/lovable-uploads/cc82d0d9-0cc3-4b47-9bbd-bbf05c39cbb9.png" alt="Agent Sign Up" className="max-w-full rounded-lg shadow-xl" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
