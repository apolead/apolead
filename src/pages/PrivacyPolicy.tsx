
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
      <div className="pt-20 pb-16 bg-gray-50">
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
            
            <h1 className="text-4xl font-bold mb-2 text-gray-800">Privacy Policy</h1>
            <div className="w-20 h-1 bg-[#00c2cb] mb-6"></div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg border border-[#4e37b3] p-8">
            <p className="text-gray-700 mb-4">Last Updated: {currentDate}</p>
            
            <div className="space-y-4 text-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">1. Introduction</h2>
                <p>
                  Apolead ("Company," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website or interact with our services.
                </p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800">2. Information We Collect</h2>
                <p>We collect the following types of personally identifiable information (PII):</p>
                <ul className="list-disc pl-6 space-y-0.5">
                  <li>Name</li>
                  <li>Address</li>
                  <li>Phone Number</li>
                </ul>
                <p>
                  We obtain this information through third-party lead providers and web forms submitted by consumers.
                </p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800">3. How We Use Your Information</h2>
                <p>We use the collected PII for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-0.5">
                  <li><span className="font-medium">Lead Qualification:</span> Assessing consumer interest and eligibility for products or services.</li>
                  <li><span className="font-medium">Marketing Communications:</span> Sending relevant offers, promotions, and updates (with the option to opt out).</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800">4. Data Retention</h2>
                <p>
                  We retain consumer PII for 120 days, after which it is securely deleted.
                </p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800">5. How We Protect Your Information</h2>
                <p>We take data security seriously and use the following safeguards:</p>
                <ul className="list-disc pl-6 space-y-0.5">
                  <li><span className="font-medium">Encryption at Rest:</span> All stored data is encrypted.</li>
                  <li><span className="font-medium">Secure Databases:</span> Data is stored in protected databases with industry-standard security measures.</li>
                  <li><span className="font-medium">Access Controls:</span> Only authorized personnel have access to stored PII.</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800">6. Consumer Rights</h2>
                <p>
                  You have the right to opt out of marketing communications at any time. To do so, please submit a request via our <Link to="/contact" className="text-blue-600 hover:underline inline-flex items-center">Webform <ExternalLink className="ml-1 h-3 w-3" /></Link>.
                </p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800">7. Cookies and Tracking Technologies</h2>
                <p>
                  We use analytics cookies and advertising cookies to enhance user experience and improve marketing efforts. Consumers can manage cookie preferences through our standard cookie management settings.
                </p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800">8. Data Storage and Processing</h2>
                <p>
                  All data is processed and stored within the United States. We do not transfer consumer data internationally.
                </p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800">9. Compliance with Laws</h2>
                <p>Apolead complies with the following regulations:</p>
                <ul className="list-disc pl-6 space-y-0.5">
                  <li><span className="font-medium">Telephone Consumer Protection Act (TCPA)</span> – Governing telemarketing and call consent.</li>
                  <li><span className="font-medium">CAN-SPAM Act</span> – Regulating marketing emails and providing opt-out mechanisms.</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800">10. Privacy Policy Updates</h2>
                <p>
                  We may update this Privacy Policy periodically. Changes will be posted on our website with a revised effective date.
                </p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800">11. Age Restrictions</h2>
                <p>
                  Our services are intended for individuals 18 years or older. We do not knowingly collect data from minors under 18.
                </p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800">12. Contact Information</h2>
                <p>
                  For privacy-related inquiries, you may contact us via:
                </p>
                <p>
                  Email: <a href="mailto:support@apolead.com" className="text-blue-600 hover:underline">support@apolead.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
