import React from 'react';
const Benefits = () => {
  const benefits = [{
    icon: "fas fa-home",
    title: "Zero Commute Time",
    description: "Save time and money by eliminating daily commutes. Work directly from your home office."
  }, {
    icon: "fas fa-calendar-alt",
    title: "Work-Life Balance",
    description: "Enjoy true work-life balance by creating a schedule that fits your lifestyle and personal commitments."
  }, {
    icon: "fas fa-headset",
    title: "Professional Support",
    description: "Never feel alone with our 24/7 agent support team, ready to help you succeed."
  }, {
    icon: "fas fa-trophy",
    title: "Performance Bonuses",
    description: "Earn additional income through our performance-based bonus system and incentives."
  }];
  return <section id="benefits" className="bg-light py-20">
      <div className="container">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 md:pr-12 mb-12 md:mb-0 animate-fadeInUp">
            <h2 className="mb-4">Benefits of Working with <span className="text-secondary">Apo<span className="text-primary">Lead</span></span></h2>
            <p className="mb-8">Our agents enjoy numerous benefits that traditional call centers simply can't match. Experience the freedom and flexibility of the gig economy with the stability and support of a professional organization.</p>
            
            {benefits.map((benefit, index) => <div key={index} className="flex mb-6">
                <div className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-primary bg-opacity-10 text-primary text-xl mr-4 flex-shrink-0">
                  <i className={benefit.icon}></i>
                </div>
                <div>
                  <h4 className="text-lg mb-2">{benefit.title}</h4>
                  <p className="text-base mb-0">{benefit.description}</p>
                </div>
              </div>)}
          </div>
          
          <div className="md:w-1/2 animate-fadeInUp animate-fadeInUp-delay-2">
            <div className="animate-floating">
              <img alt="Agent Benefits" className="max-w-full rounded-lg shadow-xl" src="/lovable-uploads/2925fe51-12c8-456c-ade1-41aa7d924135.jpg" />
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Benefits;