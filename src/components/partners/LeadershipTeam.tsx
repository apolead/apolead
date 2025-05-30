
import React from 'react';
import LeaderProfile from './LeaderProfile';

const LeadershipTeam = () => {
  const leaders = [
    {
      name: "Drew Conrad",
      title: "CEO",
      imageSrc: "/lovable-uploads/913900be-1b79-44cb-997d-1967b1fea81c.png",
      altText: "Drew Conrad - CEO",
      description: [
        "With over 25 years of experience in the call center industry, Drew has held every role from agent to director, including supporting functions like Quality Assurance, Training, Workforce Management, and Technology. He's also led vendor management for a global workforce of 25,000 employees and has spent the last five years championing AI integration in the call center space.",
        "Beyond the business world, Drew is an active volunteer and community leader, committed to mentoring youth and fostering growth in the Scouting America program. His work ethic and passion for helping others drive his mission to create sustainable, high-performing call centers that prioritize both compliance and care."
      ]
    },
    {
      name: "Dara Phillips",
      title: "COO",
      imageSrc: "/lovable-uploads/920336f2-0a2a-425e-ae25-29d9efc3fb4c.png",
      altText: "Dara Phillips - COO",
      description: [
        "With over 15 years of experience in SaaS operations and enterprise customer success, Dara specializes in scaling technology-driven solutions that deliver measurable impact. She has led cross-functional teams, developed governance models for Fortune 100 clients, and driven digital transformation through strategic customer engagement and technology adoption.",
        "Outside of work, Dara is deeply committed to giving back—partnering with local shelters to support homeless families and working to improve the communities around her. Her focus on operational excellence and social impact reflects a belief that true success is measured by both business outcomes and human connection."
      ]
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Meet Our Leadership Team</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Decades of combined experience in building, managing, and scaling call center operations across multiple industries.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {leaders.map((leader, index) => (
            <LeaderProfile key={index} {...leader} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LeadershipTeam;
