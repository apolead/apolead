
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const PartnerHero = () => {
  const isMobile = useIsMobile();

  return (
    <section className="pt-32 pb-20 relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white">
      <div className="container relative z-[2]">
        <div className="text-center mb-16">
          <h1 className={`mb-6 text-dark font-bold ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
            Global Teams. <span className="text-primary">Human Engagement.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            When you partner with ApoLead, you gain a dedicated engagement team that combines skilled people, structured processes, and scalable systems to help you reach the people who matter most.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PartnerHero;
