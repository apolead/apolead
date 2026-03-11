
import React from 'react';

const PartnershipBenefits = () => {
  const benefits = [
    {
      number: "1",
      title: "Rapid Program Launches",
      description: "Get your engagement programs up and running quickly with our proven onboarding and training processes."
    },
    {
      number: "2",
      title: "Transparent Reporting",
      description: "Real-time dashboards and outcome tracking keep you informed on real progress, not just activity metrics."
    },
    {
      number: "3",
      title: "Flexible Scaling",
      description: "Whether you need hundreds or tens of thousands of daily conversations, our model grows alongside your needs."
    },
    {
      number: "4",
      title: "Outcome-Driven Teams",
      description: "Every conversation is designed to help people move toward a clear outcome—rebuilding credit, finding contractors, completing applications, or accessing services."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Why Organizations Partner With ApoLead</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Organizations work with us because we deliver the rare combination of skilled teams, cost-efficient operations, structured processes, and measurable outcomes.
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
