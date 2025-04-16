
export interface Script {
  id: string;
  title: string;
  product: string;
  company: string;
  type: 'Hard Sell' | 'Soft Sell';
  content: {
    sections: {
      heading: string;
      text: string[] | { title: string; content: string }[];
    }[];
  };
}

const scripts: Script[] = [
  {
    id: 'credit-repair-hard-sell',
    title: 'Credit Repair',
    product: 'Credit Repair',
    company: 'Credit Coach',
    type: 'Hard Sell',
    content: {
      sections: [
        {
          heading: 'Opening',
          text: ["Hi [first name], this is [your first name] on a recorded line with Credit Coach. [I'm calling you today / I'm glad you called back] because you indicated you're struggling with credit problems that are holding you back financially. We specialize in turning those situations around fast."]
        },
        {
          heading: 'Discovery',
          text: [
            "Have you attempted to fix your credit score yet, or are you still dealing with the consequences of poor credit?",
            "I understand. And what specific opportunities or purchases are you missing out on right now because of your credit situation? A home? Car? Business loan?",
            "That's exactly why people come to us! Poor credit is costing you thousands of dollars and limiting your options every single day. Let me ask you a few quick questions to see how quickly we can start transforming your financial future.",
            "When was the last time you actually looked at your full credit report?",
            "And do you know exactly how many negative items are currently damaging your score?",
            "What about your current credit score? Do you know the exact number?",
            "Are you at least 18 and currently employed with income to invest in your financial future?"
          ]
        },
        {
          heading: 'Information Sharing',
          text: [
            "[Customer name], based on what you've told me, you're an ideal candidate for our premium credit restoration service. I'm going to connect you immediately with Credit Saint, one of the nation's top-rated credit repair specialists with a proven track record of removing negative items and boosting scores fast.",
            "They're going to give you a complete credit analysis and help you identify exactly what's holding your score down and outline a specific plan to eliminate those negative items. This is the exact same process that's helped thousands of people just like you qualify for mortgages, car loans, and business funding."
          ]
        },
        {
          heading: 'Objection Handling',
          text: [
            "I understand your hesitation, but consider this: every day you wait with a low credit score costs you real money in higher interest rates and missed opportunities.",
            "You mentioned wanting to [customer's goal]. Without addressing these credit issues, that goal will remain out of reach, potentially for years.",
            "This isn't just another consultation - Credit Saint has a documented success rate that's among the highest in the industry. Their specialists focus exclusively on credit restoration.",
            "The consultation is completely free with no obligation. You'd pay a credit advisor at least $150 for the same detailed analysis they're offering at no cost. What do you have to lose except those negative items on your report?"
          ]
        },
        {
          heading: 'Transition to Transfer',
          text: [
            "Does that sound like something worth 15 minutes of your time right now?",
            "Excellent decision! I'm connecting you directly to a senior credit consultant who can get started immediately. I'll stay on the line to make the introduction... just one moment please."
          ]
        },
        {
          heading: 'Common Objections and Responses',
          text: [
            {
              title: '"I\'m not interested right now"',
              content: "I understand timing is important. However, most people who say that don't realize that waiting just 30 days with unresolved credit issues typically costs hundreds in higher interest rates and fees. The longer negative items remain, the more they damage your score. Today's free consultation takes just 15 minutes but could save you thousands. Can I at least connect you to learn exactly what's hurting your score?"
            },
            {
              title: '"I can fix it myself"',
              content: "I respect your confidence, and some people do try the DIY approach. What we've found is that most people spend months on trial and error, often making costly mistakes. Credit Saint's experts have proprietary methods and relationships with credit bureaus that typically remove negative items 3x faster than self-help attempts. Wouldn't you rather have experts with a 90% success rate handling this while you focus on the other things going on in your life?"
            },
            {
              title: '"How much does it cost?"',
              content: "The consultation we're scheduling today is completely free - with no obligation whatsoever. If you decide to work with Credit Saint after learning about your situation, their programs start at just $79/month - significantly less than what most people are currently losing each month to high interest rates due to poor credit. Remember, improving your score by just 40 points often saves hundreds monthly on existing loans. Isn't it worth a free conversation to see what's possible?"
            },
            {
              title: '"Can you email me information instead?"',
              content: "I understand wanting information in writing, but credit repair is highly specific to your unique situation. General information won't tell you which items on YOUR report can be removed or how much YOUR score could improve. The free consultation is personalized to your exact credit profile. It takes just 15 minutes and will give you specific answers that no email ever could. Can I connect you now with someone who can provide those real answers?"
            }
          ]
        },
        {
          heading: 'Credit Saint Warm Transfer Script',
          text: [
            {
              title: 'Standard Version',
              content: "Hello, this is [your name] with Credit Coach. I have [customer first and last name] on the line who's interested in a credit consultation. [Customer first name] has identified some negative items on their credit report and is looking for professional guidance. For your records, their phone number is [10-digit phone number] in case you get disconnected.\n\n[Customer first name], you're now in good hands with Credit Saint. They're experts at addressing credit concerns and will guide you through the next steps. I'll drop off the line now, and I wish you all the best with improving your credit situation!"
            },
            {
              title: 'Brief Version',
              content: "Hello, this is [your name] from Credit Coach transferring [customer first and last name]. [Customer first name] is seeking help with negative items on their credit report. Their callback number is [10-digit phone number].\n\n[Customer first name], I'm leaving you with Credit Saint's expert team now. You're in excellent hands for your credit consultation. I wish you great success with your credit improvement journey!"
            },
            {
              title: 'Hard-Sell Version',
              content: "Hello, this is [your name] with Credit Coach. I'm transferring [customer first and last name] who's ready to address some significant credit challenges. [Customer first name] has multiple negative items impacting their score and needs your team's expertise to restore their credit profile. Their contact number is [10-digit phone number].\n\n[Customer first name], I'm connecting you with Credit Saint's top specialists who have an exceptional track record of credit restoration success. They'll provide the expert guidance we discussed to help you achieve your financial goals. I'll step off the line now so you can get started right away!"
            }
          ]
        },
        {
          heading: 'Additional Notes',
          text: [
            "Always use a warm, professional tone when transferring",
            "Ensure you clearly state both the customer's first and last name",
            "Always provide the callback number in case of disconnection",
            "Give the customer reassurance before dropping off",
            "Keep the transfer concise but complete"
          ]
        }
      ]
    }
  },
  {
    id: 'credit-repair-soft-sell',
    title: 'Credit Repair',
    product: 'Credit Repair',
    company: 'Credit Coach',
    type: 'Soft Sell',
    content: {
      sections: [
        {
          heading: 'Opening',
          text: ["Hello [first name], my name is [your first name], and I'm calling from Credit Coach on a recorded line. [I'm reaching out today / Thank you for returning our call] because you expressed interest in learning about options for improving your credit health."]
        },
        {
          heading: 'Discovery',
          text: [
            "I'm curious - have you taken any steps so far to address your credit concerns?",
            "I appreciate you sharing that. If I may ask, what would improving your credit allow you to accomplish in your life?",
            "That sounds like a meaningful goal. Good credit does open more doors and creates more financial flexibility. If you're comfortable, I'd like to ask a few simple questions to better understand your situation.",
            "When did you last have a chance to review your credit report?",
            "And do you happen to know if there are any negative items currently affecting your report?",
            "Just for context, are you aware of your approximate credit score range?",
            "Lastly, to confirm eligibility for our services, may I ask if you're at least 18 years old and currently have some form of employment?"
          ]
        },
        {
          heading: 'Information Sharing',
          text: [
            "Thank you for sharing that information, [customer name]. Based on what you've mentioned, I think you might benefit from a complimentary credit consultation with Credit Saint. They're a highly respected credit restoration company that helps people understand their credit situation and explore potential improvement options.",
            "During this no-obligation conversation, they can review your credit summary, discuss your current score, and help identify any factors that might be affecting your rating."
          ]
        },
        {
          heading: 'Objection Handling',
          text: [
            "I completely understand your perspective. Many people share that concern initially.",
            "The good news is that this consultation is entirely free and comes with absolutely no obligation. It's simply an opportunity to gain more clarity about your credit situation.",
            "Credit Saint is consistently top-rated because they focus on education first - helping you understand your options before you make any decisions.",
            "Many people find that just having an expert explain their credit report in plain language helps them feel more confident about their next steps, whatever those might be.",
            "Would it be helpful to at least learn what specific factors are affecting your credit score right now, even if you decide to address them on your own?"
          ]
        },
        {
          heading: 'Transition to Transfer',
          text: [
            "Would you be interested in learning more about this free resource?",
            "Wonderful. I'd be happy to introduce you to one of their credit consultants right now. I'll stay on the line to make a warm introduction if that's alright with you. One moment while I connect you."
          ]
        },
        {
          heading: 'Common Objections and Responses',
          text: [
            {
              title: '"I\'m not interested right now"',
              content: "I completely understand. Many people feel they want to wait for a better time. If you don't mind me asking, is there a specific concern about learning more today? The consultation is brief and free, with no obligation, and many find it helpful just to understand their current situation better, even if they decide to address it later."
            },
            {
              title: '"I can fix it myself"',
              content: "That's absolutely an option many people consider. The free consultation actually supports that approach by giving you professional insights into exactly what's affecting your score. Many clients tell us that even if they ultimately handled some items themselves, the expert analysis helped them focus on the right priorities and avoid common mistakes. Would having that expert perspective be helpful for your DIY approach?"
            },
            {
              title: '"How much does it cost?"',
              content: "Today's credit consultation is completely free with no obligation. Credit Saint offers various service options that they can explain during your consultation, but there's absolutely no pressure to proceed. Many people simply use the free consultation to gain clarity about their situation before deciding on their next steps. Would you like to at least learn about your options?"
            },
            {
              title: '"Can you email me information instead?"',
              content: "I'd be happy to have information sent to you. However, credit situations are quite unique to each individual. The benefit of the brief consultation is that it provides insights specific to your credit profile rather than general information. Would it be helpful to have both? I can arrange for the free consultation now, which gives you personalized guidance, and also request that follow-up information be sent to your email."
            }
          ]
        },
        {
          heading: 'Credit Saint Warm Transfer Script',
          text: [
            {
              title: 'Standard Version',
              content: "Hello, this is [your name] with Credit Coach. I have [customer first and last name] on the line who's interested in a credit consultation. [Customer first name] has identified some negative items on their credit report and is looking for professional guidance. For your records, their phone number is [10-digit phone number] in case you get disconnected.\n\n[Customer first name], you're now in good hands with Credit Saint. They're experts at addressing credit concerns and will guide you through the next steps. I'll drop off the line now, and I wish you all the best with improving your credit situation!"
            },
            {
              title: 'Brief Version',
              content: "Hello, this is [your name] from Credit Coach transferring [customer first and last name]. [Customer first name] is seeking help with negative items on their credit report. Their callback number is [10-digit phone number].\n\n[Customer first name], I'm leaving you with Credit Saint's expert team now. You're in excellent hands for your credit consultation. I wish you great success with your credit improvement journey!"
            },
            {
              title: 'Soft-Sell Version',
              content: "Hi there, this is [your name] from Credit Coach. I'm introducing [customer first and last name] who's interested in learning more about credit improvement options. [Customer first name] has some concerns about their credit report and would appreciate your insights. Their phone number is [10-digit phone number] if needed.\n\n[Customer first name], I'm now connecting you with Credit Saint's consultation team. They'll provide the helpful information we discussed about understanding and potentially improving your credit situation. I'll leave you to your conversation now, and I wish you all the best!"
            }
          ]
        },
        {
          heading: 'Additional Notes',
          text: [
            "Always use a warm, professional tone when transferring",
            "Ensure you clearly state both the customer's first and last name",
            "Always provide the callback number in case of disconnection",
            "Give the customer reassurance before dropping off",
            "Keep the transfer concise but complete"
          ]
        }
      ]
    }
  }
];

export default scripts;
