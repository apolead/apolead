
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
    <div className="waitlist-banner bg-[#4e37b3] shadow-lg relative overflow-hidden py-2.5 px-5 font-inter w-full z-[1001] fixed top-0 left-0">
      <div className="waitlist-container flex items-center justify-between relative z-[2] gap-5 px-[5px] max-w-[1200px] mx-auto">
        <div className="waitlist-left flex items-center flex-1 gap-2">
          <h3 className="text-white text-base font-semibold whitespace-nowrap">Applications Closed</h3>
          <span className="inline-block px-2 py-0.5 bg-[rgba(1,194,203,0.25)] text-[#01c2cb] rounded text-xs font-semibold tracking-wider whitespace-nowrap">WAITLIST</span>
          <span className="text-[rgba(255,255,255,0.95)] text-sm m-0 whitespace-nowrap">Join our waitlist to be notified when we open spots!</span>
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
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Close banner"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default WaitlistBanner;
