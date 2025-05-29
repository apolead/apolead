
import React from 'react';

const ExpertiseGrid = () => {
  const expertiseAreas = [
    {
      title: "Operational Excellence",
      description: "Proven track record of building efficient, scalable call center operations that deliver consistent results while maintaining high quality standards."
    },
    {
      title: "Technology Integration",
      description: "Deep expertise in implementing and optimizing modern call center technologies, CRM systems, and workforce management platforms."
    },
    {
      title: "Global Workforce Management",
      description: "Extensive experience in recruiting, training, and managing distributed teams across multiple countries and time zones."
    },
    {
      title: "Quality Assurance",
      description: "Comprehensive QA frameworks that ensure consistent service delivery and continuous improvement across all client engagements."
    },
    {
      title: "Industry Knowledge",
      description: "Cross-industry experience including healthcare, financial services, e-commerce, SaaS, and telecommunications sectors."
    },
    {
      title: "Strategic Partnership",
      description: "Collaborative approach that aligns our operations with your business objectives and growth strategies."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Our Combined Expertise</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Together, we bring a unique combination of operational excellence, technology innovation, and global workforce management.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {expertiseAreas.map((area, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">{area.title}</h3>
              <p className="text-gray-600">{area.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExpertiseGrid;
