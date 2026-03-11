
import React from 'react';

const ExpertiseGrid = () => {
  const expertiseAreas = [
    {
      title: "Skilled Global Teams",
      description: "Educated, highly motivated professionals located across developing economies, delivering exceptional engagement quality."
    },
    {
      title: "Structured Engagement",
      description: "Proven conversation frameworks and follow-up processes designed to help people take the next step toward their goals."
    },
    {
      title: "Scalable Operations",
      description: "Systems and training programs that allow us to scale from hundreds to tens of thousands of daily conversations."
    },
    {
      title: "Measurable Outcomes",
      description: "We measure success by real progress made—not simply interactions completed. Transparent reporting keeps you informed."
    },
    {
      title: "Program Flexibility",
      description: "From financial improvement and credit education to home improvement matching and service enrollment support."
    },
    {
      title: "Social Impact",
      description: "Creating meaningful economic opportunities for talented professionals while delivering high-quality outcomes for partners."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">What Sets Us Apart</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We don't just provide staffing—we provide engagement programs designed to help organizations better serve the people who rely on them.
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
