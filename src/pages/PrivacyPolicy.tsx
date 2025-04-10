
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <>
      <Header />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <Button 
              asChild
              variant="outline"
              className="mb-6 flex items-center"
            >
              <Link to="/">
                <ArrowLeft className="mr-2 h-5 w-5" /> 
                Back to Home
              </Link>
            </Button>
            
            <h1 className="text-4xl font-bold mb-4 text-gray-800">Privacy Policy</h1>
            <div className="w-20 h-1 bg-[#00c2cb] mb-8"></div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-8">
            <p className="text-gray-700 mb-6">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Introduction</h2>
              <p className="mb-4">
                ApoLead ("we," "our," or "us") respects your privacy and is committed to protecting it through our compliance with this policy. This policy describes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>The types of information we may collect from you or that you may provide when you visit our website at apolead.com ("Website").</li>
                <li>Our practices for collecting, using, maintaining, protecting, and disclosing that information.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Information We Collect</h2>
              <p className="mb-4">We collect several types of information from and about users of our Website, including:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Personal information such as name, email address, phone number, and government-issued ID that you provide when applying to become an agent.</li>
                <li>Information about your internet connection, the equipment you use to access our Website, and usage details.</li>
                <li>Non-personal information about your interactions with our Website, including browser type and language, access times, and referring website addresses.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">How We Use Your Information</h2>
              <p className="mb-4">We use information that we collect about you or that you provide to us, including any personal information:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>To present our Website and its contents to you.</li>
                <li>To process your application to become an ApoLead agent.</li>
                <li>To provide you with information, products, or services that you request from us.</li>
                <li>To fulfill any other purpose for which you provide it.</li>
                <li>To carry out our obligations and enforce our rights arising from any contracts entered into between you and us.</li>
                <li>To notify you about changes to our Website or any products or services we offer or provide through it.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Data Security</h2>
              <p className="mb-4">
                We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All information you provide to us is stored on secure servers behind firewalls.
              </p>
              <p className="mb-4">
                The safety and security of your information also depends on you. We urge you to be careful about giving out information in public areas of the Website. The information you share in public areas may be viewed by any user of the Website.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Changes to Our Privacy Policy</h2>
              <p className="mb-4">
                It is our policy to post any changes we make to our privacy policy on this page. If we make material changes to how we treat our users' personal information, we will notify you through a notice on the Website home page.
              </p>
              <p className="mb-4">
                The date the privacy policy was last revised is identified at the top of the page. You are responsible for periodically visiting our Website and this privacy policy to check for any changes.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Contact Information</h2>
              <p className="mb-4">
                To ask questions or comment about this privacy policy and our privacy practices, contact us at: privacy@apolead.com
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
