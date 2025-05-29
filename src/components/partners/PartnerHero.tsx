
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const PartnerHero = () => {
  const isMobile = useIsMobile();

  return (
    <section className="pt-32 pb-20 relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white">
      <div className="container relative z-[2]">
        <div className="text-center mb-16">
          <h1 className={`mb-6 text-dark font-bold ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
            Partnership That <span className="text-primary">Delivers Results</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            When you partner with ApoLead, you're not just getting a service provider – you're gaining experienced leaders who understand what it takes to build and scale successful BPO operations.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PartnerHero;
