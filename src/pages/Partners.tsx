import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const Partners = () => {
  const isMobile = useIsMobile();

  return (
    <div className="overflow-x-hidden">
      <div className="flex flex-col">
        <Header />
        
        {/* Hero Section */}
        <section className="pt-32 pb-20 relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white">
          <div className="container relative z-[2]">
            <div className="text-center mb-16">
              <h1 className={`mb-6 text-dark font-bold ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
                Partnership That <span className="text-primary">Delivers Results</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                When you partner with ApoLead, you're not just getting a service provider – you're gaining experienced leaders who understand what it takes to build and scale successful BPO operations.
              </p>
            </div>
          </div>
        </section>

        {/* Leadership Team Section */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Meet Our Leadership Team</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Decades of combined experience in building, managing, and scaling call center operations across multiple industries.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Drew Conrad - CEO */}
              <div className="text-center">
                <div className="w-64 h-64 mx-auto mb-6 bg-gray-200 rounded-lg overflow-hidden">
                  <img src="/lovable-uploads/c5f8f03a-0700-44d1-a0be-9f2b7ffb32c6.png" alt="Drew Conrad - CEO" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Drew Conrad</h3>
                <p className="text-lg text-primary mb-4">CEO</p>
                <div className="text-left max-w-md mx-auto">
                  <p className="text-gray-600 leading-relaxed">
                    With over 25 years of experience in the call center industry, Drew has held every role from agent to director, including supporting functions like Quality Assurance, Training, Workforce Management, and Technology. He's also led vendor management for a global workforce of 25,000 employees and has spent the last five years championing AI integration in the call center space.
                  </p>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    Beyond the business world, Drew is an active volunteer and community leader, committed to mentoring youth and fostering growth in the Scouting America program. His work ethic and passion for helping others drive his mission to create sustainable, high-performing call centers that prioritize both compliance and care.
                  </p>
                </div>
              </div>

              {/* Dara Phillips - COO */}
              <div className="text-center">
                <div className="w-64 h-64 mx-auto mb-6 bg-gray-200 rounded-lg overflow-hidden">
                  <img src="/lovable-uploads/fe175e53-bedd-48a4-83a1-d3942b3875d8.png" alt="Dara Phillips - COO" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Dara Phillips</h3>
                <p className="text-lg text-primary mb-4">COO</p>
                <div className="text-left max-w-md mx-auto">
                  <p className="text-gray-600 leading-relaxed">
                    With over 15 years of experience in SaaS operations and enterprise customer success, Dara specializes in scaling technology-driven solutions that deliver measurable impact. She has led cross-functional teams, developed governance models for Fortune 100 clients, and driven digital transformation through strategic customer engagement and technology adoption.
                  </p>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    Outside of work, Dara is deeply committed to giving back—partnering with local shelters to support homeless families and working to improve the communities around her. Her focus on operational excellence and social impact reflects a belief that true success is measured by both business outcomes and human connection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience & Expertise Section */}
        <section className="py-20 bg-gray-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Our Combined Expertise</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Together, we bring a unique combination of operational excellence, technology innovation, and global workforce management.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Operational Excellence</h3>
                <p className="text-gray-600">Proven track record of building efficient, scalable call center operations that deliver consistent results while maintaining high quality standards.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Technology Integration</h3>
                <p className="text-gray-600">Deep expertise in implementing and optimizing modern call center technologies, CRM systems, and workforce management platforms.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Global Workforce Management</h3>
                <p className="text-gray-600">Extensive experience in recruiting, training, and managing distributed teams across multiple countries and time zones.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Quality Assurance</h3>
                <p className="text-gray-600">Comprehensive QA frameworks that ensure consistent service delivery and continuous improvement across all client engagements.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Industry Knowledge</h3>
                <p className="text-gray-600">Cross-industry experience including healthcare, financial services, e-commerce, SaaS, and telecommunications sectors.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Strategic Partnership</h3>
                <p className="text-gray-600">Collaborative approach that aligns our operations with your business objectives and growth strategies.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Partnership Benefits Section */}
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
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Rapid Deployment</h3>
                    <p className="text-gray-600">Get your operations up and running in weeks, not months, with our proven onboarding process.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Transparent Reporting</h3>
                    <p className="text-gray-600">Real-time dashboards and comprehensive analytics keep you informed every step of the way.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Flexible Scaling</h3>
                    <p className="text-gray-600">Scale up or down based on demand with our elastic workforce model and flexible pricing.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Dedicated Support</h3>
                    <p className="text-gray-600">Direct access to our leadership team and dedicated account management for your success.</p>
                  </div>
                </div>
              </div>
              <div>
                <img src="/pexels-yankrukov-8867257.jpg" alt="Partnership Success" className="max-w-full rounded-lg shadow-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-indigo-600 text-white">
          <div className="container text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Explore Partnership?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Let's discuss how ApoLead can become your strategic BPO partner and help drive your business forward.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Schedule a Consultation
              </Link>
              <a href="tel:+1-555-0123" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors">
                Call Now: (555) 012-3456
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default Partners;
