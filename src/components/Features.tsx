
import React from 'react';

const Features = () => {
  const features = [
    {
      icon: "fas fa-globe",
      title: "Work From Anywhere",
      description: "No commute, no office politics. Just you and your computer from the comfort of your home or anywhere in the world with a stable internet connection."
    },
    {
      icon: "fas fa-clock",
      title: "Flexible Schedule",
      description: "Choose when you work. Set your own hours that fit around your lifestyle, family commitments, or studies. Minimal weekly requirements with maximum flexibility."
    },
    {
      icon: "fas fa-dollar-sign",
      title: "Competitive Pay",
      description: "Earn what you're worth. Our performance-based compensation ensures top performers are rewarded generously. Get paid weekly directly to your account."
    },
    {
      icon: "fas fa-graduation-cap",
      title: "Comprehensive Training",
      description: "Our intuitive online training program gets you qualified quickly. Learn at your own pace with interactive modules and quizzes that prepare you for success."
    },
    {
      icon: "fas fa-laptop",
      title: "Cutting-Edge Platform",
      description: "Our cloud-based platform is easy to use and accessible from any device. Get real-time performance insights and support when you need it."
    },
    {
      icon: "fas fa-chart-line",
      title: "Growth Opportunities",
      description: "Start as an agent and grow your career. Top performers can advance to team leaders, trainers, and even management positions with increased benefits."
    }
  ];

  return (
    <section className="bg-light py-20">
      <div className="container">
        <h2 className="text-center mb-4">Why Choose <span className="text-secondary">Apo<span className="text-primary">Lead</span></span>?</h2>
        <p className="text-center mb-16 max-w-3xl mx-auto">We're revolutionizing the way call center agents work with our flexible, remote-first approach.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl p-8 shadow-md transition-all duration-300 hover:translate-y-[-10px] hover:shadow-xl animate-fadeInUp animate-fadeInUp-delay-${index % 4}`}
            >
              <div className="feature-icon">
                <i className={feature.icon}></i>
              </div>
              <h3 className="text-xl mb-4">{feature.title}</h3>
              <p className="text-base mb-0">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
