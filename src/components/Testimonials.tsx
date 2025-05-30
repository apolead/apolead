
import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      text: "Working for a great international partner company has been a dream come true. It's so rewarding to be part of something bigger—doing meaningful work that truly improves people's lives. Nothing beats that.",
      name: "Merry-C",
      role: "Remote Customer Service Agent",
      icon: "fas fa-user-circle"
    },
    {
      text: "Working with an international brand is incredibly exciting. It brings together diverse cultures and perspectives from around the globe, fostering unity, teamwork, and mutual respect. This collaboration drives innovation and allows us to create real change together.",
      name: "Favour B",
      role: "Cross-Cultural Team Member",
      icon: "fas fa-user-circle"
    },
    {
      text: "Working with a great international partner company has truly been life-changing for me. Coming from a place where opportunities are scarce, this role has given me more than just a job—it has given me confidence, purpose, and the chance to grow beyond my comfort zone. I went from years of unemployment to speaking with people from all over the world every day. Being part of a diverse and inclusive team where different cultures are respected and valued has made me feel seen, supported, and inspired. It has been a wonderful journey that has helped me grow both personally and professionally.",
      name: "Maureen S",
      role: "Global Communications Specialist",
      icon: "fas fa-user-circle"
    },
    {
      text: "Working at ApoLead has been a fulfilling experience. From the modern staff training techniques to the transparent decision-making style of management, this is surely the best-run organization I have ever been a part of. The compensation I receive also helps me provide quality education and healthcare for my immediate and extended family.",
      name: "Sammy O",
      role: "Operations Team Member",
      icon: "fas fa-user-circle"
    }
  ];

  return (
    <section id="testimonials" className="py-20">
      <div className="container">
        <h2 className="text-center mb-4">What Our <span className="text-primary">Team Members Say</span></h2>
        <p className="text-center mb-16 max-w-3xl mx-auto">Hear directly from our diverse team of professionals about their real experiences working with ApoLead and our international partners.</p>
        
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
                <p className="italic mb-6 leading-relaxed">{testimonial.text}</p>
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
