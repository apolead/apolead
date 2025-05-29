
import React from 'react';

const PartnershipBenefits = () => {
  const benefits = [
    {
      number: "1",
      title: "Rapid Deployment",
      description: "Get your operations up and running in weeks, not months, with our proven onboarding process."
    },
    {
      number: "2",
      title: "Transparent Reporting",
      description: "Real-time dashboards and comprehensive analytics keep you informed every step of the way."
    },
    {
      number: "3",
      title: "Flexible Scaling",
      description: "Scale up or down based on demand with our elastic workforce model and flexible pricing."
    },
    {
      number: "4",
      title: "Dedicated Support",
      description: "Direct access to our leadership team and dedicated account management for your success."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Why Partner With ApoLead?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our partnership approach goes beyond traditional vendor relationships to create true strategic alliances.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{benefit.number}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <img src="/pexels-yankrukov-8867257.jpg" alt="Partnership Success" className="max-w-full rounded-lg shadow-lg" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnershipBenefits;
