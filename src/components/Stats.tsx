
import React from 'react';

const Stats = () => {
  const stats = [
    { number: "97%", label: "Agent Satisfaction" },
    { number: "32+", label: "Countries Represented" },
    { number: "4.8", label: "Average Agent Rating" }
  ];

  return (
    <section className="bg-primary text-white py-16">
      <div className="container">
        <div className="flex flex-wrap justify-around text-center">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`mx-4 my-4 animate-fadeInUp animate-fadeInUp-delay-${index}`}
            >
              <h3 className="text-4xl font-bold mb-2 text-white">{stat.number}</h3>
              <p className="text-base text-white mb-0">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
