
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const Home = () => {
  const isMobile = useIsMobile();

  return (
    <div className="overflow-x-hidden">
      <div className="flex flex-col">
        <Header />
        
        {/* Hero Section */}
        <section className="pt-32 pb-20 relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white">
          <div className="container relative z-[2] flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 md:pr-8 mb-12 md:mb-0">
              <h1 className={`mb-6 text-dark font-bold ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
                Global BPO Excellence. <span className="text-primary">Delivered.</span>
              </h1>
              <p className="mb-8 text-xl text-gray-600 leading-relaxed">
                ApoLead connects businesses with world-class talent across 32+ countries. 
                Our distributed workforce delivers exceptional call center and customer service solutions that scale with your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/partners" className="btn btn-primary btn-large">
                  Explore Partnership →
                </Link>
                <Link to="/contact" className="btn btn-outline btn-large">
                  Get Started Today
                </Link>
              </div>
            </div>
            {!isMobile && (
              <div className="md:w-1/2">
                <img src="/pexels-yankrukov-8867257.jpg" alt="Global BPO Team" className="max-w-full rounded-lg shadow-xl" />
              </div>
            )}
          </div>
        </section>

        {/* Global Workforce Section */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Our Global Advantage</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Access to a diverse, skilled workforce spanning multiple time zones ensures 24/7 coverage and cultural alignment for your business needs.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6">
                <div className="text-5xl font-bold text-primary mb-4">32+</div>
                <div className="text-xl font-semibold mb-2">Countries Represented</div>
                <div className="text-gray-600">Global talent pool with diverse expertise and language capabilities</div>
              </div>
              <div className="text-center p-6">
                <div className="text-5xl font-bold text-primary mb-4">24/7</div>
                <div className="text-xl font-semibold mb-2">Coverage</div>
                <div className="text-gray-600">Round-the-clock support across all major time zones</div>
              </div>
              <div className="text-center p-6">
                <div className="text-5xl font-bold text-primary mb-4">100%</div>
                <div className="text-xl font-semibold mb-2">Remote Ready</div>
                <div className="text-gray-600">Fully distributed workforce with proven remote work excellence</div>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className="py-20 bg-gray-50">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">What Makes ApoLead Different</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Quality-First Approach</h3>
                      <p className="text-gray-600">Rigorous screening and continuous training ensure top-tier talent for every engagement.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Scalable Solutions</h3>
                      <p className="text-gray-600">From startup to enterprise, our infrastructure grows with your business needs.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Cultural Alignment</h3>
                      <p className="text-gray-600">Global workforce trained to understand and represent your brand values effectively.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <img src="/agent.jpg" alt="Professional Team" className="max-w-full rounded-lg shadow-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Our BPO Services</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive call center and customer service solutions tailored to your industry and business objectives.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-4">Inbound Customer Support</h3>
                <p className="text-gray-600">24/7 customer service, technical support, and order processing with multilingual capabilities.</p>
              </div>
              <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-4">Outbound Sales</h3>
                <p className="text-gray-600">Lead generation, appointment setting, and sales campaigns that drive measurable results.</p>
              </div>
              <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-4">Back Office Support</h3>
                <p className="text-gray-600">Data entry, processing, and administrative tasks to streamline your operations.</p>
              </div>
              <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-4">Live Chat Support</h3>
                <p className="text-gray-600">Real-time customer engagement across your digital channels and platforms.</p>
              </div>
              <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-4">Quality Assurance</h3>
                <p className="text-gray-600">Comprehensive monitoring and reporting to ensure service excellence.</p>
              </div>
              <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-4">Custom Solutions</h3>
                <p className="text-gray-600">Tailored BPO services designed specifically for your unique business requirements.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-indigo-600 text-white">
          <div className="container text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Scale Your Operations?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Partner with ApoLead and access a world-class workforce that delivers exceptional results for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/partners" className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Learn About Partnership
              </Link>
              <Link to="/contact" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors">
                Contact Us Today
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default Home;
