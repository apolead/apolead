
import React from 'react';
import { useToast } from '../hooks/use-toast';
import { Link } from 'react-router-dom';

const CTA = () => {
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Get form values
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    
    // Show success message
    toast({
      title: "Application Submitted!",
      description: `Thank you, ${name}! Your application has been received. We'll contact you soon at ${email}.`,
      duration: 5000,
    });
    
    // Reset form
    e.currentTarget.reset();
  };

  return (
    <section id="sign-up" className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-8 mb-12 md:mb-0 animate-fadeInUp">
            <h2 className="mb-4">Ready to Transform Your Career?</h2>
            <p className="mb-6">Join thousands of satisfied agents who have discovered the freedom and flexibility of working with <span className="text-[#00c2cb]">Apo</span><span className="text-white font-bold">Lead</span>. Your new career journey starts with a simple application.</p>
            <ul className="list-none">
              <li className="mb-2 flex items-center"><span className="mr-2">✓</span> No experience necessary - full training provided</li>
              <li className="mb-2 flex items-center"><span className="mr-2">✓</span> Minimal weekly hour requirements</li>
              <li className="mb-2 flex items-center"><span className="mr-2">✓</span> Work from anywhere with an internet connection</li>
              <li className="mb-2 flex items-center"><span className="mr-2">✓</span> Weekly payments directly to your account</li>
              <li className="mb-2 flex items-center"><span className="mr-2">✓</span> Supportive community of remote professionals</li>
            </ul>
            
            <div className="mt-8">
              <Link 
                to="/signup" 
                className="btn btn-primary btn-large inline-block hover:bg-[#00c2cb]"
              >
                Apply Now - Create Your Account
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2 animate-fadeInUp animate-fadeInUp-delay-2">
            <div className="bg-white rounded-xl p-8 shadow-xl">
              <h3 className="text-center mb-6 text-dark"><span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span> Application</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label htmlFor="name" className="block mb-2 font-semibold text-dark">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    className="w-full p-3 rounded-md border border-gray-300 text-dark" 
                    placeholder="Your full name" 
                    required 
                  />
                </div>
                
                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2 font-semibold text-dark">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    className="w-full p-3 rounded-md border border-gray-300 text-dark" 
                    placeholder="Your email address" 
                    required 
                  />
                </div>
                
                <div className="mb-5">
                  <label htmlFor="phone" className="block mb-2 font-semibold text-dark">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    className="w-full p-3 rounded-md border border-gray-300 text-dark" 
                    placeholder="Your phone number" 
                    required 
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="country" className="block mb-2 font-semibold text-dark">Country</label>
                  <input 
                    type="text" 
                    id="country" 
                    name="country" 
                    className="w-full p-3 rounded-md border border-gray-300 text-dark" 
                    placeholder="Your country of residence" 
                    required 
                  />
                </div>
                
                <button type="submit" className="btn btn-primary w-full hover:bg-[#00c2cb]">Start Your Application</button>
                
                <div className="mt-4 text-center">
                  <span className="text-dark">Or</span>{' '}
                  <Link to="/signup" className="text-primary font-semibold hover:text-[#00c2cb]">Create an Account</Link> {' '}
                  <span className="text-dark">for full access</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
