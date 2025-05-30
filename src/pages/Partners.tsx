
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PartnerHero from '../components/partners/PartnerHero';
import LeadershipTeam from '../components/partners/LeadershipTeam';
import ExpertiseGrid from '../components/partners/ExpertiseGrid';
import PartnershipBenefits from '../components/partners/PartnershipBenefits';
import PartnershipCTA from '../components/partners/PartnershipCTA';

const Partners = () => {
  return (
    <div className="overflow-x-hidden">
      <div className="flex flex-col">
        <Header />
        <PartnerHero />
        <LeadershipTeam />
        <ExpertiseGrid />
        <PartnershipBenefits />
        <PartnershipCTA />
        <Footer />
      </div>
    </div>
  );
};

export default Partners;
