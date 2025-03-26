
import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      text: "ApoLead changed my life. As a single mom, I needed flexible work that would allow me to be there for my kids. Now I work while they're at school and earn more than I did at my full-time office job!",
      name: "Sarah J.",
      role: "Working with ApoLead for 2 years",
      icon: "fas fa-user-circle"
    },
    {
      text: "I'm a digital nomad traveling through Southeast Asia. ApoLead gives me the freedom to work from anywhere while exploring the world. The platform is so easy to use, and the training prepared me perfectly.",
      name: "Miguel R.",
      role: "Working with ApoLead for 1 year",
      icon: "fas fa-user-circle"
    },
    {
      text: "As a college student, ApoLead has been the perfect solution for earning money while studying. I can work between classes and during evenings. The flexible schedule means I never have to choose between work and education.",
      name: "Aisha K.",
      role: "Working with ApoLead for 6 months",
      icon: "fas fa-user-circle"
    },
    {
      text: "After 15 years in a traditional call center, I was skeptical about remote work. Now I can't imagine going back to an office! With ApoLead, I've increased my income while working fewer hours, and the support team is always there when I need them.",
      name: "Robert T.",
      role: "Working with ApoLead for 3 years",
      icon: "fas fa-user-circle"
    }
  ];

  return (
    <section id="testimonials" className="py-20">
      <div className="container">
        <h2 className="text-center mb-4">What Our <span className="text-primary">Agents Say</span></h2>
        <p className="text-center mb-16 max-w-3xl mx-auto">Read what our agents from around the world have to say about their experience with ApoLead.</p>
        
        <div className="flex flex-wrap justify-between">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className={`w-full md:w-[calc(50%-1rem)] mb-8 bg-white rounded-xl p-8 shadow-md relative`}
            >
              <div className="relative">
                <div className="absolute top-[-15px] left-[-10px] text-5xl text-primary opacity-10">
                  <i className="fas fa-quote-left"></i>
                </div>
                <p className="italic mb-6">{testimonial.text}</p>
                <div className="flex items-center">
                  <div className="w-[50px] h-[50px] flex items-center justify-center text-3xl text-primary mr-4">
                    <i className={testimonial.icon}></i>
                  </div>
                  <div>
                    <h5 className="text-base font-semibold mb-1">{testimonial.name}</h5>
                    <p className="text-sm text-gray mb-0">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
