
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PartnerHero from '../components/partners/PartnerHero';
import LeadershipTeam from '../components/partners/LeadershipTeam';
import ExpertiseGrid from '../components/partners/ExpertiseGrid';
import PartnershipBenefits from '../components/partners/PartnershipBenefits';
import PartnershipCTA from '../components/partners/PartnershipCTA';

const Partners = () => {
  // Add debugging to check what paths are being resolved
  React.useEffect(() => {
    console.log('Current location:', window.location.href);
    console.log('Base URL:', window.location.origin);
    console.log('Attempting to load images from lovable-uploads directory');
    
    // Test if we can fetch the images directly
    const testImagePaths = [
      '/lovable-uploads/c5f8f03a-0700-44d1-a0be-9f2b7ffb32c6.png',
      '/lovable-uploads/fe175e53-bedd-48a4-83a1-d3942b3875d8.png',
      'lovable-uploads/c5f8f03a-0700-44d1-a0be-9f2b7ffb32c6.png',
      'lovable-uploads/fe175e53-bedd-48a4-83a1-d3942b3875d8.png'
    ];
    
    testImagePaths.forEach(path => {
      const img = new Image();
      img.onload = () => console.log(`✅ Image loaded successfully: ${path}`);
      img.onerror = () => console.log(`❌ Failed to load image: ${path}`);
      img.src = path;
    });
  }, []);

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
