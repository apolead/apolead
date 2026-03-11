
import React from 'react';
import { Link } from 'react-router-dom';

const PartnershipCTA = () => {
  return (
    <section className="py-20 bg-primary text-white">
      <div className="container text-center">
        <h2 className="text-4xl font-bold mb-6">Helping People Take the Next Step</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Let's discuss how ApoLead's global teams and engagement programs can help your organization reach the people who matter most.
        </p>
        <div className="flex justify-center">
          <Link to="/contact" className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Partner With Us
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PartnershipCTA;
