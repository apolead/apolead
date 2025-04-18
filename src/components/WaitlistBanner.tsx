
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface WaitlistBannerProps {
  isEnabled?: boolean;
}

const WaitlistBanner: React.FC<WaitlistBannerProps> = ({ isEnabled = true }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isEnabled || !isVisible) {
    return null;
  }

  return (
    <div className="waitlist-banner bg-[#4e37b3] shadow-lg relative overflow-hidden py-2.5 px-5 font-inter">
      <div className="waitlist-container flex items-center justify-between relative z-[2] gap-5 px-[5px]">
        <div className="waitlist-left flex items-center flex-1 gap-2">
          <div className="alert-icon mr-2.5 flex">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div className="waitlist-text flex items-center flex-wrap gap-3">
            <h3 className="waitlist-heading text-white text-base m-0 font-semibold whitespace-nowrap">Applications Closed</h3>
            <span className="waitlist-badge inline-block px-2 py-0.5 bg-[rgba(1,194,203,0.25)] text-[#01c2cb] rounded text-xs font-semibold tracking-wider whitespace-nowrap">WAITLIST</span>
            <span className="waitlist-message text-[rgba(255,255,255,0.95)] text-sm m-0 whitespace-nowrap">Join our waitlist to be notified when we open spots!</span>
          </div>
        </div>
        <div className="waitlist-form flex-1 max-w-[400px]">
          <form 
            action="https://apolead.us17.list-manage.com/subscribe/post?u=6d89babf6077a3768c73c188c&amp;id=2accbb3a8a&amp;f_id=0091b9e0f0" 
            method="post" 
            id="mc-embedded-subscribe-form" 
            name="mc-embedded-subscribe-form" 
            className="validate flex items-center w-full" 
            target="_blank"
          >
            <div className="waitlist-input-group relative flex-1 min-w-0">
              <input 
                type="email" 
                name="EMAIL" 
                placeholder="Enter your email address" 
                required 
                className="w-full px-4 py-2 border-none rounded bg-[rgba(255,255,255,0.95)] text-sm transition-all duration-200 mr-[5px] focus:outline-none focus:bg-white focus:shadow-[0_0_0_3px_rgba(1,194,203,0.2)]"
              />
            </div>
            <button 
              type="submit" 
              name="subscribe" 
              className="bg-[#01c2cb] text-white border-none px-4 py-2 rounded font-semibold cursor-pointer text-sm whitespace-nowrap transition-all duration-200 shadow-md hover:bg-[#00adb5] hover:-translate-y-[1px] hover:shadow-lg flex-shrink-0"
            >
              Join Waitlist
            </button>
            <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
              <input type="text" name="b_6d89babf6077a3768c73c188c_2accbb3a8a" tabIndex={-1} value="" />
            </div>
          </form>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
          aria-label="Close banner"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default WaitlistBanner;
