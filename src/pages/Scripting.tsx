
import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useAuth } from '@/hooks/useAuth';
import { Search, Star, Download, Edit, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const scripts = [
  {
    id: 1,
    type: "Hard Sell",
    company: "Credit Saint",
    title: "Hard Sell",
    category: "Credit Repair",
    description: "Assertive credit repair script designed to convert leads with credit problems into Credit Saint consultations.",
    rating: 4,
    reviews: 42,
    content: {
      intro: "Use this script when: Speaking with prospects who have credit issues and need professional help to improve their credit score.",
      sections: [
        {
          title: "Opening",
          content: "\"Hi [first name], this is [your first name] on a recorded line with Credit Coach. [I'm calling you today / I'm glad you called back] because you indicated you're struggling with credit problems that are holding you back financially. We specialize in turning those situations around fast.\""
        },
        {
          title: "Discovery",
          content: "\"Have you attempted to fix your credit score yet, or are you still dealing with the consequences of poor credit?\n\nI understand. And what specific opportunities or purchases are you missing out on right now because of your credit situation? A home? Car? Business loan?\n\nThat's exactly why people come to us! Poor credit is costing you thousands of dollars and limiting your options every single day. Let me ask you a few quick questions to see how quickly we can start transforming your financial future.\n\nWhen was the last time you actually looked at your full credit report?\n\nAnd do you know exactly how many negative items are currently damaging your score?\n\nWhat about your current credit score? Do you know the exact number?\n\nAre you at least 18 and currently employed with income to invest in your financial future?\""
        },
        {
          title: "Information Sharing",
          content: "\"[Customer name], based on what you've told me, you're an ideal candidate for our premium credit restoration service. I'm going to connect you immediately with Credit Saint, one of the nation's top-rated credit repair specialists with a proven track record of removing negative items and boosting scores fast.\n\nThey're going to give you a complete credit analysis and help you identify exactly what's holding your score down and outline a specific plan to eliminate those negative items. This is the exact same process that's helped thousands of people just like you qualify for mortgages, car loans, and business funding.\""
        },
        {
          title: "Objection Handling",
          content: "\"I understand your hesitation, but consider this: every day you wait with a low credit score costs you real money in higher interest rates and missed opportunities.\n\nYou mentioned wanting to [customer's goal]. Without addressing these credit issues, that goal will remain out of reach, potentially for years.\n\nThis isn't just another consultation - Credit Saint has a documented success rate that's among the highest in the industry. Their specialists focus exclusively on credit restoration.\n\nThe consultation is completely free with no obligation. You'd pay a credit advisor at least $150 for the same detailed analysis they're offering at no cost. What do you have to lose except those negative items on your report?\""
        },
        {
          title: "Transition to Transfer",
          content: "\"Does that sound like something worth 15 minutes of your time right now?\n\nExcellent decision! I'm connecting you directly to a senior credit consultant who can get started immediately. I'll stay on the line to make the introduction... just one moment please.\""
        }
      ],
      objections: [
        {
          objection: "\"I'm not interested right now\"",
          response: "I understand timing is important. However, most people who say that don't realize that waiting just 30 days with unresolved credit issues typically costs hundreds in higher interest rates and fees. The longer negative items remain, the more they damage your score. Today's free consultation takes just 15 minutes but could save you thousands. Can I at least connect you to learn exactly what's hurting your score?"
        },
        {
          objection: "\"I can fix it myself\"",
          response: "I respect your confidence, and some people do try the DIY approach. What we've found is that most people spend months on trial and error, often making costly mistakes. Credit Saint's experts have proprietary methods and relationships with credit bureaus that typically remove negative items 3x faster than self-help attempts. Wouldn't you rather have experts with a 90% success rate handling this while you focus on the other things going on in your life?"
        },
        {
          objection: "\"How much does it cost?\"",
          response: "The consultation we're scheduling today is completely free - with no obligation whatsoever. If you decide to work with Credit Saint after learning about your situation, their programs start at just $79/month - significantly less than what most people are currently losing each month to high interest rates due to poor credit. Remember, improving your score by just 40 points often saves hundreds monthly on existing loans. Isn't it worth a free conversation to see what's possible?"
        },
        {
          objection: "\"Can you email me information instead?\"",
          response: "I understand wanting information in writing, but credit repair is highly specific to your unique situation. General information won't tell you which items on YOUR report can be removed or how much YOUR score could improve. The free consultation is personalized to your exact credit profile. It takes just 15 minutes and will give you specific answers that no email ever could. Can I connect you now with someone who can provide those real answers?"
        }
      ],
      transfer: [
        {
          title: "Standard Version",
          content: "\"Hello, this is [your name] with Credit Coach. I have [customer first and last name] on the line who's interested in a credit consultation. [Customer first name] has identified some negative items on their credit report and is looking for professional guidance. For your records, their phone number is [10-digit phone number] in case you get disconnected.\n\n[Customer first name], you're now in good hands with Credit Saint. They're experts at addressing credit concerns and will guide you through the next steps. I'll drop off the line now, and I wish you all the best with improving your credit situation!\""
        },
        {
          title: "Brief Version",
          content: "\"Hello, this is [your name] from Credit Coach transferring [customer first and last name]. [Customer first name] is seeking help with negative items on their credit report. Their callback number is [10-digit phone number].\n\n[Customer first name], I'm leaving you with Credit Saint's expert team now. You're in excellent hands for your credit consultation. I wish you great success with your credit improvement journey!\""
        },
        {
          title: "Hard-Sell Version",
          content: "\"Hello, this is [your name] with Credit Coach. I'm transferring [customer first and last name] who's ready to address some significant credit challenges. [Customer first name] has multiple negative items impacting their score and needs your team's expertise to restore their credit profile. Their contact number is [10-digit phone number].\n\n[Customer first name], I'm connecting you with Credit Saint's top specialists who have an exceptional track record of credit restoration success. They'll provide the expert guidance we discussed to help you achieve your financial goals. I'll step off the line now so you can get started right away!\""
        }
      ]
    }
  },
  {
    id: 2,
    type: "Soft Sell",
    company: "Credit Saint",
    title: "Soft Sell",
    category: "Credit Repair",
    description: "Educational approach focused on understanding the prospect's credit situation and offering free consultation.",
    rating: 5,
    reviews: 37,
    content: {
      intro: "Use this script when: Speaking with prospects who want to improve their credit but need education and a gentler approach.",
      sections: [
        {
          title: "Opening",
          content: "\"Hello [first name], my name is [your first name], and I'm calling from Credit Coach on a recorded line. [I'm reaching out today / Thank you for returning our call] because you expressed interest in learning about options for improving your credit health.\""
        },
        {
          title: "Discovery",
          content: "\"I'm curious - have you taken any steps so far to address your credit concerns?\n\nI appreciate you sharing that. If I may ask, what would improving your credit allow you to accomplish in your life?\n\nThat sounds like a meaningful goal. Good credit does open more doors and creates more financial flexibility. If you're comfortable, I'd like to ask a few simple questions to better understand your situation.\n\nWhen did you last have a chance to review your credit report?\n\nAnd do you happen to know if there are any negative items currently affecting your report?\n\nJust for context, are you aware of your approximate credit score range?\n\nLastly, to confirm eligibility for our services, may I ask if you're at least 18 years old and currently have some form of employment?\""
        },
        {
          title: "Information Sharing",
          content: "\"Thank you for sharing that information, [customer name]. Based on what you've mentioned, I think you might benefit from a complimentary credit consultation with Credit Saint. They're a highly respected credit restoration company that helps people understand their credit situation and explore potential improvement options.\n\nDuring this no-obligation conversation, they can review your credit summary, discuss your current score, and help identify any factors that might be affecting your rating.\""
        },
        {
          title: "Objection Handling",
          content: "\"I completely understand your perspective. Many people share that concern initially.\n\nThe good news is that this consultation is entirely free and comes with absolutely no obligation. It's simply an opportunity to gain more clarity about your credit situation.\n\nCredit Saint is consistently top-rated because they focus on education first - helping you understand your options before you make any decisions.\n\nMany people find that just having an expert explain their credit report in plain language helps them feel more confident about their next steps, whatever those might be.\n\nWould it be helpful to at least learn what specific factors are affecting your credit score right now, even if you decide to address them on your own?\""
        },
        {
          title: "Transition to Transfer",
          content: "\"Would you be interested in learning more about this free resource?\n\nWonderful. I'd be happy to introduce you to one of their credit consultants right now. I'll stay on the line to make a warm introduction if that's alright with you. One moment while I connect you.\""
        }
      ],
      objections: [
        {
          objection: "\"I'm not interested right now\"",
          response: "I completely understand. Many people feel they want to wait for a better time. If you don't mind me asking, is there a specific concern about learning more today? The consultation is brief and free, with no obligation, and many find it helpful just to understand their current situation better, even if they decide to address it later."
        },
        {
          objection: "\"I can fix it myself\"",
          response: "That's absolutely an option many people consider. The free consultation actually supports that approach by giving you professional insights into exactly what's affecting your score. Many clients tell us that even if they ultimately handled some items themselves, the expert analysis helped them focus on the right priorities and avoid common mistakes. Would having that expert perspective be helpful for your DIY approach?"
        },
        {
          objection: "\"How much does it cost?\"",
          response: "Today's credit consultation is completely free with no obligation. Credit Saint offers various service options that they can explain during your consultation, but there's absolutely no pressure to proceed. Many people simply use the free consultation to gain clarity about their situation before deciding on their next steps. Would you like to at least learn about your options?"
        },
        {
          objection: "\"Can you email me information instead?\"",
          response: "I'd be happy to have information sent to you. However, credit situations are quite unique to each individual. The benefit of the brief consultation is that it provides insights specific to your credit profile rather than general information. Would it be helpful to have both? I can arrange for the free consultation now, which gives you personalized guidance, and also request that follow-up information be sent to your email."
        }
      ],
      transfer: [
        {
          title: "Soft-Sell Version",
          content: "\"Hi there, this is [your name] from Credit Coach. I'm introducing [customer first and last name] who's interested in learning more about credit improvement options. [Customer first name] has some concerns about their credit report and would appreciate your insights. Their phone number is [10-digit phone number] if needed.\n\n[Customer first name], I'm now connecting you with Credit Saint's consultation team. They'll provide the helpful information we discussed about understanding and potentially improving your credit situation. I'll leave you to your conversation now, and I wish you all the best!\""
        }
      ]
    }
  }
];

const Scripting = () => {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState<number | null>(null);
  
  // Filter scripts based on search term
  const filteredScripts = scripts.filter(script => 
    script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('modal')) {
        setModalOpen(null);
        document.body.style.overflow = 'auto';
      }
    };

    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Handle opening a modal
  const openModal = (scriptId: number) => {
    setModalOpen(scriptId);
    document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
  };

  // Handle closing a modal
  const closeModal = () => {
    setModalOpen(null);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  // Create star rating display
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 mr-1 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar activeItem="scripting" />
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-6 py-4 rounded-lg shadow-md mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Scripting Resources</h1>
              <div className="text-sm text-gray-100">ApoLead.com</div>
            </div>
            <p className="mt-2 text-gray-100">Access professional credit repair scripts to maximize conversion</p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <div className="flex items-center bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="pl-4 pr-2 text-gray-400">
                <Search size={18} />
              </div>
              <Input 
                type="text" 
                placeholder="Search scripts by keyword or objective..." 
                className="border-0 focus-visible:ring-0 py-3 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 transition duration-300">
                Search
              </button>
            </div>
          </div>

          {/* Script Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredScripts.map((script) => (
              <div 
                key={script.id} 
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition duration-300 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => openModal(script.id)}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">{script.title}</h3>
                    <span className={`${script.title === "Hard Sell" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"} text-xs px-2 py-1 rounded-full`}>
                      {script.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{script.description}</p>
                  <div className="text-xs text-gray-500 mb-4">Credit: {script.company}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {renderStars(script.rating)}
                      <span className="text-xs text-gray-500 ml-1">({script.reviews})</span>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">View Script</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Script Button */}
          <div className="mt-8 text-center">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg shadow transition">
              <Plus size={16} className="inline mr-2" /> Add Custom Script
            </button>
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>© 2025 ApoLead.com - Professional Sales Resources</p>
          </footer>
        </div>
      </div>

      {/* Script Modals */}
      {scripts.map((script) => (
        <div 
          key={`modal-${script.id}`} 
          className={`fixed inset-0 z-50 bg-black/50 p-4 overflow-y-auto ${modalOpen === script.id ? 'block' : 'hidden'} modal`}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-auto my-8 overflow-hidden">
            <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">{script.title} Script</h3>
              <button 
                className="text-white hover:text-gray-200 text-2xl" 
                onClick={closeModal}
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <span className={`${script.title === "Hard Sell" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"} text-xs px-2 py-1 rounded-full mr-2`}>
                    {script.category}
                  </span>
                  <span className="text-xs text-gray-500">Credit: {script.company}</span>
                </div>
                <p className="text-gray-600 mb-2 text-sm italic">{script.content.intro}</p>
              </div>
              
              {/* Script Sections */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                {script.content.sections.map((section, idx) => (
                  <div key={`section-${script.id}-${idx}`} className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-3">{section.title}</h4>
                    <p className="text-gray-700 mb-4 whitespace-pre-line">{section.content}</p>
                  </div>
                ))}
              </div>
              
              {/* Objections Section */}
              <div className={`${script.title === "Hard Sell" ? "bg-yellow-50 border-yellow-200" : "bg-blue-50 border-blue-200"} p-4 rounded-lg mb-6 border`}>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className={`${script.title === "Hard Sell" ? "text-yellow-500" : "text-blue-500"} mr-2`}>
                    {script.title === "Hard Sell" ? "⚡" : "💡"}
                  </span>
                  Common Objections and Responses
                </h4>
                <div className="text-gray-700 text-sm space-y-4">
                  {script.content.objections.map((obj, idx) => (
                    <div key={`objection-${script.id}-${idx}`}>
                      <p className="font-medium mb-1">{obj.objection}</p>
                      <p>{obj.response}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Transfer Scripts */}
              <h4 className="font-semibold text-gray-800 mb-3 mt-6">Credit Saint Warm Transfer Script</h4>
              <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                {script.content.transfer.map((transfer, idx) => (
                  <div key={`transfer-${script.id}-${idx}`} className="mb-4">
                    <p className="text-gray-700 mb-4">
                      <span className="font-medium">{transfer.title}</span><br />
                      <span className="whitespace-pre-line">{transfer.content}</span>
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-between">
                <button className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition flex items-center">
                  <Download size={16} className="mr-1" /> Download
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition flex items-center">
                  <Edit size={16} className="mr-1" /> Customize
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Scripting;
