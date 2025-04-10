
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
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
            
            <h1 className="text-4xl font-bold mb-4 text-gray-800">Terms of Service</h1>
            <div className="w-20 h-1 bg-[#00c2cb] mb-8"></div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-8">
            <p className="text-gray-700 mb-6">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Agreement to Terms</h2>
              <p className="mb-4">
                These Terms of Service constitute a legally binding agreement made between you and ApoLead ("we," "us," or "our"), concerning your access to and use of the ApoLead website and services.
              </p>
              <p className="mb-4">
                You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these Terms of Service, then you are expressly prohibited from using the Site and you must discontinue use immediately.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Agent Eligibility Requirements</h2>
              <p className="mb-4">To be eligible to apply as an ApoLead agent, you must:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Be at least 18 years of age.</li>
                <li>Have a valid government-issued ID or passport.</li>
                <li>Have reliable high-speed internet access.</li>
                <li>Have a quiet workspace suitable for call center operations.</li>
                <li>Have necessary equipment including a computer and headset that meet our technical specifications.</li>
                <li>Have excellent communication skills in English and any other required languages.</li>
                <li>Be able to commit to the minimum required hours as specified in your agent agreement.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Agent Application Process</h2>
              <p className="mb-4">The agent application process includes:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Completing the online application form with all required information.</li>
                <li>Verification of identity through submission of government-issued ID.</li>
                <li>Skills assessment and interview process.</li>
                <li>Background check (where applicable by law).</li>
                <li>Training program completion (if application is approved).</li>
              </ul>
              <p className="mb-4">
                ApoLead reserves the right to reject any application at our sole discretion. All personal information provided during the application process will be handled in accordance with our Privacy Policy.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Intellectual Property Rights</h2>
              <p className="mb-4">
                The Site and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by ApoLead, its licensors, or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
              </p>
              <p className="mb-4">
                These Terms of Service permit you to use the Site for your personal, non-commercial use only. You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Site.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Limitation of Liability</h2>
              <p className="mb-4">
                In no event will ApoLead, its affiliates, or their licensors, service providers, employees, agents, officers, or directors be liable for damages of any kind, under any legal theory, arising out of or in connection with your use, or inability to use, the Site, any websites linked to it, any content on the Site or such other websites, including any direct, indirect, special, incidental, consequential, or punitive damages.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Governing Law</h2>
              <p className="mb-4">
                These Terms of Service and your use of the Site are governed by and construed in accordance with the laws of the United States and the State of Delaware, without regard to its conflict of law principles.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Changes to the Terms of Service</h2>
              <p className="mb-4">
                We may revise and update these Terms of Service from time to time in our sole discretion. All changes are effective immediately when we post them.
              </p>
              <p className="mb-4">
                Your continued use of the Site following the posting of revised Terms of Service means that you accept and agree to the changes. You are expected to check this page frequently so you are aware of any changes, as they are binding on you.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TermsOfService;
