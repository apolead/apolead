
import React from 'react';
import { Link } from 'react-router-dom';

const PartnershipCTA = () => {
  return (
    <section className="py-20 bg-indigo-600 text-white">
      <div className="container text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Explore Partnership?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Let's discuss how ApoLead can become your strategic BPO partner and help drive your business forward.
        </p>
        <div className="flex justify-center">
          <Link to="/contact" className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Schedule a Consultation
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PartnershipCTA;
