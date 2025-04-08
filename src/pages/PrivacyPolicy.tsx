
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const PrivacyPolicy = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  return (
    <>
      <Header />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="mb-6">
            <Button 
              asChild
              variant="outline"
              className="mb-4 flex items-center"
            >
              <Link to="/">
                <ArrowLeft className="mr-2 h-5 w-5" /> 
                Back to Home
              </Link>
            </Button>
            
            <h1 className="text-4xl font-bold mb-4 text-gray-800">Privacy Policy</h1>
            <div className="w-20 h-1 bg-[#00c2cb] mb-6"></div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-8">
            <p className="text-gray-700 mb-5">Last Updated: {currentDate}</p>
            
            <section className="mb-5">
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">1. Introduction</h2>
              <p className="mb-3 text-gray-700">
                Apolead ("Company," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website or interact with our services.
              </p>
            </section>
            
            <section className="mb-5">
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">2. Information We Collect</h2>
              <p className="mb-3 text-gray-700">We collect the following types of personally identifiable information (PII):</p>
              <ul className="list-disc pl-6 mb-3 space-y-1 text-gray-700">
                <li>Name</li>
                <li>Address</li>
                <li>Phone Number</li>
              </ul>
              <p className="mb-3 text-gray-700">
                We obtain this information through third-party lead providers and web forms submitted by consumers.
              </p>
            </section>
            
            <section className="mb-5">
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">3. How We Use Your Information</h2>
              <p className="mb-3 text-gray-700">We use the collected PII for the following purposes:</p>
              <ul className="list-disc pl-6 mb-3 space-y-1 text-gray-700">
                <li><span className="font-medium">Lead Qualification:</span> Assessing consumer interest and eligibility for products or services.</li>
                <li><span className="font-medium">Marketing Communications:</span> Sending relevant offers, promotions, and updates (with the option to opt out).</li>
              </ul>
            </section>
            
            <section className="mb-5">
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">4. Data Retention</h2>
              <p className="mb-3 text-gray-700">
                We retain consumer PII for 120 days, after which it is securely deleted.
              </p>
            </section>
            
            <section className="mb-5">
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">5. How We Protect Your Information</h2>
              <p className="mb-3 text-gray-700">We take data security seriously and use the following safeguards:</p>
              <ul className="list-disc pl-6 mb-3 space-y-1 text-gray-700">
                <li><span className="font-medium">Encryption at Rest:</span> All stored data is encrypted.</li>
                <li><span className="font-medium">Secure Databases:</span> Data is stored in protected databases with industry-standard security measures.</li>
                <li><span className="font-medium">Access Controls:</span> Only authorized personnel have access to stored PII.</li>
              </ul>
            </section>
            
            <section className="mb-5">
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">6. Consumer Rights</h2>
              <p className="mb-3 text-gray-700">
                You have the right to opt out of marketing communications at any time. To do so, please submit a request via our <Link to="/contact" className="text-blue-600 hover:underline inline-flex items-center">Webform <ExternalLink className="ml-1 h-3 w-3" /></Link>.
              </p>
            </section>
            
            <section className="mb-5">
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">7. Cookies and Tracking Technologies</h2>
              <p className="mb-3 text-gray-700">
                We use analytics cookies and advertising cookies to enhance user experience and improve marketing efforts. Consumers can manage cookie preferences through our standard cookie management settings.
              </p>
            </section>
            
            <section className="mb-5">
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">8. Data Storage and Processing</h2>
              <p className="mb-3 text-gray-700">
                All data is processed and stored within the United States. We do not transfer consumer data internationally.
              </p>
            </section>
            
            <section className="mb-5">
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">9. Compliance with Laws</h2>
              <p className="mb-3 text-gray-700">Apolead complies with the following regulations:</p>
              <ul className="list-disc pl-6 mb-3 space-y-1 text-gray-700">
                <li><span className="font-medium">Telephone Consumer Protection Act (TCPA)</span> – Governing telemarketing and call consent.</li>
                <li><span className="font-medium">CAN-SPAM Act</span> – Regulating marketing emails and providing opt-out mechanisms.</li>
              </ul>
            </section>
            
            <section className="mb-5">
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">10. Privacy Policy Updates</h2>
              <p className="mb-3 text-gray-700">
                We may update this Privacy Policy periodically. Changes will be posted on our website with a revised effective date.
              </p>
            </section>
            
            <section className="mb-5">
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">11. Age Restrictions</h2>
              <p className="mb-3 text-gray-700">
                Our services are intended for individuals 18 years or older. We do not knowingly collect data from minors under 18.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">12. Contact Information</h2>
              <p className="mb-3 text-gray-700">
                For privacy-related inquiries, you may contact us via:
              </p>
              <p className="text-gray-700">
                Email: <a href="mailto:support@apolead.com" className="text-blue-600 hover:underline">support@apolead.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
