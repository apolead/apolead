
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
        <section className="pt-32 pb-20 relative overflow-hidden bg-gradient-to-br from-blue-50 to-white">
          <div className="container relative z-[2] flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 md:pr-8 mb-12 md:mb-0">
              <h1 className={`mb-6 text-dark font-bold ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
                Human-Powered Engagement <span className="text-primary">at Scale</span>
              </h1>
              <p className="mb-4 text-xl text-gray-600 leading-relaxed">
                ApoLead connects organizations with highly trained global teams who help people take action—whether that means improving their financial future, completing major home projects, or accessing important services.
              </p>
              <p className="mb-8 text-lg text-gray-500 leading-relaxed">
                We combine skilled people, structured processes, and scalable systems to help organizations engage the people they serve and drive meaningful outcomes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="btn btn-primary btn-large">
                  Partner With Us →
                </Link>
              </div>
            </div>
            {!isMobile && (
              <div className="md:w-1/2">
                <img src="/pexels-yankrukov-8867257.jpg" alt="Global Engagement Team" className="max-w-full rounded-lg shadow-xl" />
              </div>
            )}
          </div>
        </section>

        {/* What We Do Section */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">What We Do</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                ApoLead helps organizations connect with people in meaningful ways. Our teams manage conversations, follow-ups, and guided support that help individuals move forward with important decisions.
              </p>
              <p className="text-lg text-gray-500 max-w-3xl mx-auto mt-4 leading-relaxed">
                Instead of focusing only on generating leads or handling calls, we focus on helping people take the next step, while delivering measurable outcomes for the organizations we support.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow text-center">
                <h3 className="text-lg font-semibold mb-3">Customer Outreach</h3>
                <p className="text-gray-600">Contact the people who matter most</p>
              </div>
              <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow text-center">
                <h3 className="text-lg font-semibold mb-3">Home Improvement</h3>
                <p className="text-gray-600">Contractor matching and home project support</p>
              </div>
              <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow text-center">
                <h3 className="text-lg font-semibold mb-3">Service Enrollment</h3>
                <p className="text-gray-600">Onboarding and service enrollment assistance</p>
              </div>
              <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow text-center">
                <h3 className="text-lg font-semibold mb-3">Follow-Up Engagement</h3>
                <p className="text-gray-600">Re-engagement for incomplete applications</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Approach - People First */}
        <section className="py-20 bg-gray-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Our Approach</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-primary">People First</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  At the heart of ApoLead is our global team. Our agents are educated, highly motivated professionals located across developing economies where meaningful employment opportunities can be limited.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  By creating stable, consistent work, we help our team members build long-term careers while delivering exceptional support to the people they speak with. This approach allows us to combine social impact with high-quality engagement.
                </p>
              </div>
              <div>
                <img src="/agent.jpg" alt="Our Global Team" className="max-w-full rounded-lg shadow-lg" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Focused on Outcomes */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-2xl font-bold mb-4 text-primary">Focused on Outcomes</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Every conversation our teams have is designed to help people move toward a clear outcome. We measure success by real progress made, not simply interactions completed.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Helping someone start rebuilding their credit</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Connecting a homeowner with the right contractor</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Assisting someone in completing an application</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Guiding someone through the next step in accessing a service</li>
                </ul>
              </div>

              {/* Built to Scale */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-2xl font-bold mb-4 text-primary">Built to Scale</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Our systems, training programs, and operational structure allow us to scale quickly without sacrificing quality.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Flexible staffing</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Rapid program launches</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Consistent performance at high volume</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Whether a program requires hundreds of daily conversations or tens of thousands, ApoLead is designed to grow alongside our partners.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Partner Section */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Why Organizations Partner With ApoLead</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We don't just provide staffing—we provide engagement programs designed to help organizations better serve the people who rely on them.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 border rounded-lg text-center">
                <div className="text-primary text-2xl mb-3">✔</div>
                <h3 className="text-lg font-semibold mb-2">Skilled Global Teams</h3>
                <p className="text-gray-600">Dedicated and trained professionals delivering quality engagement</p>
              </div>
              <div className="p-6 border rounded-lg text-center">
                <div className="text-primary text-2xl mb-3">✔</div>
                <h3 className="text-lg font-semibold mb-2">Cost-Efficient Operations</h3>
                <p className="text-gray-600">High-quality output with sustainable cost structures</p>
              </div>
              <div className="p-6 border rounded-lg text-center">
                <div className="text-primary text-2xl mb-3">✔</div>
                <h3 className="text-lg font-semibold mb-2">Structured Processes</h3>
                <p className="text-gray-600">Proven engagement frameworks that drive consistency</p>
              </div>
              <div className="p-6 border rounded-lg text-center">
                <div className="text-primary text-2xl mb-3">✔</div>
                <h3 className="text-lg font-semibold mb-2">Measurable Outcomes</h3>
                <p className="text-gray-600">Real results tracked and reported transparently</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-gray-50">
          <div className="container text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              ApoLead was built on a simple belief: <strong>business success and human impact can go hand in hand.</strong>
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              We help organizations grow and operate more effectively while creating meaningful economic opportunities for talented professionals around the world.
            </p>
            <p className="text-lg text-gray-500 leading-relaxed">
              When the organizations we partner with succeed, our people succeed—and the individuals they serve move closer to their goals.
            </p>
          </div>
        </section>

        {/* Real People Real Progress */}
        <section className="py-20 bg-white">
          <div className="container text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Real People. Real Progress.</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              Every day our teams speak with people who are trying to improve their lives—whether that means repairing their credit, starting a home project, continuing their education, or accessing important services.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              By combining empathy, training, and structure, our teams help people move forward with clarity and confidence.
            </p>
            <p className="text-2xl font-bold text-primary">
              Human Conversations. Real Outcomes.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="container text-center">
            <h2 className="text-4xl font-bold mb-6">Helping People Take the Next Step</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Partner with ApoLead and connect with a global team built to drive meaningful engagement and measurable outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Partner With Us
              </Link>
              <Link to="/partners" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors">
                Learn More
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
