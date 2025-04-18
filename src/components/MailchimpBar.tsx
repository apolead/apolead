
import React, { useState } from 'react';
import { X } from 'lucide-react';

const MailchimpBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-white border-b z-50">
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        aria-label="Close subscription bar"
      >
        <X size={20} />
      </button>
      <div id="mc_embed_signup" className="max-w-6xl mx-auto px-4 py-3">
        <form 
          action="https://apolead.us17.list-manage.com/subscribe/post?u=6d89babf6077a3768c73c188c&amp;id=2accbb3a8a&amp;f_id=0091b9e0f0" 
          method="post" 
          id="mc-embedded-subscribe-form" 
          name="mc-embedded-subscribe-form" 
          className="validate flex items-center justify-center gap-4 flex-wrap" 
          target="_blank"
        >
          <div className="flex items-center gap-2">
            <label htmlFor="mce-EMAIL" className="text-sm font-medium">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input 
              type="email" 
              name="EMAIL" 
              className="required email px-3 py-1 border rounded" 
              id="mce-EMAIL" 
              required 
            />
          </div>
          <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
            <input 
              type="text" 
              name="b_6d89babf6077a3768c73c188c_2accbb3a8a" 
              tabIndex={-1} 
              value="" 
            />
          </div>
          <input 
            type="submit" 
            value="Subscribe" 
            name="subscribe" 
            id="mc-embedded-subscribe" 
            className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700 transition-colors cursor-pointer"
          />
        </form>
      </div>
    </div>
  );
};

export default MailchimpBar;
