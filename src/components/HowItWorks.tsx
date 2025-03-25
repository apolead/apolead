
import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Apply Online",
      description: "Complete our simple online application in less than 5 minutes to start your journey."
    },
    {
      number: 2,
      title: "Complete Training",
      description: "Access our interactive training modules and pass the qualification quizzes."
    },
    {
      number: 3,
      title: "Set Your Schedule",
      description: "Choose your working hours and availability with our flexible scheduling system."
    },
    {
      number: 4,
      title: "Start Earning",
      description: "Log in to our platform and start taking calls to earn competitive pay."
    }
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="container">
        <h2 className="text-center mb-4">How It <span className="text-primary">Works</span></h2>
        <p className="text-center mb-16 max-w-3xl mx-auto">Getting started with ApoLead is quick and easy. You could be earning within days!</p>
        
        <div className="flex flex-col md:flex-row justify-between relative">
          {/* Line connecting steps - visible only on md+ screens */}
          <div className="absolute top-[50px] left-[10%] w-[80%] h-0.5 bg-gray-200 z-0 hidden md:block"></div>
          
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`relative z-[1] flex flex-col items-center text-center mb-12 md:mb-0 md:w-1/4 animate-fadeInUp animate-fadeInUp-delay-${index}`}
            >
              <div className="flex items-center justify-center w-[60px] h-[60px] rounded-full bg-primary text-white text-2xl font-bold mb-6">
                {step.number}
              </div>
              <h4 className="text-xl mb-3">{step.title}</h4>
              <p className="text-base max-w-[200px] mx-auto mb-0">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
