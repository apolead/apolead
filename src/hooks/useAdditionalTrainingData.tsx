
import React from 'react';
import { AdditionalTrainingModule, AdditionalTrainingQuestion } from '@/types/additional-training';

export const additionalTrainingModules: AdditionalTrainingModule[] = [
  {
    id: '1',
    title: 'Introduction Module',
    description: 'Introduction to ReadyMode AI Dialer system',
    video_url: 'https://youtu.be/nejx5KiN-ro',
    module_order: 1,
  },
  {
    id: '2',
    title: 'ReadyMode Navigation Basics',
    description: 'Learn about the main navigation areas in ReadyMode',
    video_url: 'https://youtu.be/p84R6ZiKQkk',
    module_order: 2,
  },
  {
    id: '3',
    title: 'Availability & Status Management',
    description: 'Learn how to manage your availability modes',
    video_url: 'https://youtu.be/c1Z1W50ydLA',
    module_order: 3,
  },
  {
    id: '4',
    title: 'AI Dialer Operations',
    description: 'Understanding how the AI Dialer works',
    video_url: 'https://youtu.be/BvP3d__2M2w',
    module_order: 4,
  },
  {
    id: '5',
    title: 'Lead Management',
    description: 'Learn how to manage leads effectively',
    video_url: 'https://youtu.be/0AJKAOiEq84',
    module_order: 5,
  },
  {
    id: '6',
    title: 'Callback Management',
    description: 'Learn how to schedule and manage callbacks',
    video_url: 'https://youtu.be/UWE7KTr0uaM',
    module_order: 6,
  },
  {
    id: '7',
    title: 'Call Handling Tools',
    description: 'Using the dial pad and other call handling features',
    video_url: 'https://youtu.be/CmGKIy_hg3A',
    module_order: 7,
  },
  {
    id: '8',
    title: 'Conclusion',
    description: 'Recap of all ReadyMode features',
    video_url: 'https://youtu.be/TAjKRbP9eRU',
    module_order: 8,
  },
];

export const additionalTrainingQuestions: AdditionalTrainingQuestion[] = [
  // Module 2: ReadyMode Navigation Basics
  {
    id: '2-1',
    module_id: '2',
    question: 'What are the four main navigation areas in ReadyMode?',
    options: [
      'Dashboard, Side Navigation, Center Panel, and Status Bar',
      'Dashboard, Top Navigation, Workspace, and Bottom Navigation',
      'Main Menu, Quick Access, Display Area, and Settings',
      'Home, Search, Reports, and Settings'
    ],
    correct_answer: 1,
    question_order: 1
  },
  {
    id: '2-2',
    module_id: '2',
    question: 'Where can you find your lead files in ReadyMode?',
    options: [
      'In the Reports section',
      'Under My Account',
      'In My Files under the Dashboard',
      'In the Bottom Navigation area'
    ],
    correct_answer: 2,
    question_order: 2
  },
  {
    id: '2-3',
    module_id: '2',
    question: 'Which navigation area shows Callback Notifications, Folders, and Reports?',
    options: [
      'Top Navigation',
      'Workspace',
      'Dashboard',
      'Bottom Navigation'
    ],
    correct_answer: 2,
    question_order: 3
  },
  {
    id: '2-4',
    module_id: '2',
    question: 'Where is the Workspace located in the ReadyMode interface?',
    options: [
      'On the left side of the screen',
      'At the top of the screen',
      'In the center of the screen',
      'At the bottom of the screen'
    ],
    correct_answer: 2,
    question_order: 4
  },
  
  // Module 3: Availability & Status Management
  {
    id: '3-1',
    module_id: '3',
    question: "Which availability mode should you select when you're ready to take both outbound and inbound calls?",
    options: [
      'Prep Work',
      'Break',
      'Ready',
      'Inbound Only'
    ],
    correct_answer: 2,
    question_order: 1
  },
  {
    id: '3-2',
    module_id: '3',
    question: "What happens when you switch to 'Ready' mode?",
    options: [
      'The system pauses all calls',
      'You receive only inbound calls',
      'The dialer activates and begins connecting calls',
      'Your status is hidden from managers'
    ],
    correct_answer: 2,
    question_order: 2
  },
  {
    id: '3-3',
    module_id: '3',
    question: 'When you first log into ReadyMode, which mode is automatically selected?',
    options: [
      'Ready',
      'Prep Work',
      'Break',
      'Last Call'
    ],
    correct_answer: 1,
    question_order: 3
  },
  {
    id: '3-4',
    module_id: '3',
    question: "True or False: You can select Prep Work mode again after you've changed to a different mode during the day.",
    options: [
      'True',
      'False'
    ],
    correct_answer: 1,
    question_order: 4
  },
  
  // Module 4: AI Dialer Operations
  {
    id: '4-1',
    module_id: '4',
    question: "What happens when the AI Dialer connects with a lead who answers?",
    options: [
      "You hear a beep and see the lead's information on your screen",
      'The call goes to voicemail automatically',
      'You must manually accept the call',
      'The call is transferred to your manager'
    ],
    correct_answer: 0,
    question_order: 1
  },
  {
    id: '4-2',
    module_id: '4',
    question: 'What is the correct sequence for handling a call with the AI Dialer?',
    options: [
      'Answer Call → End Call → Handle Call → Disposition Call → Switch to Ready',
      'Switch to Ready → Answer Call → Handle Call → Disposition Call → End Call',
      'Switch to Ready → Handle Call → Answer Call → End Call → Disposition Call',
      'Answer Call → Switch to Ready → Handle Call → Disposition Call → End Call'
    ],
    correct_answer: 1,
    question_order: 2
  },
  {
    id: '4-3',
    module_id: '4',
    question: 'If you need to take a short break during your shift, which availability mode should you select?',
    options: [
      'Last Call',
      'Break',
      'Inbound Only',
      'Prep Work'
    ],
    correct_answer: 1,
    question_order: 3
  },
  {
    id: '4-4',
    module_id: '4',
    question: 'What is the purpose of call dispositioning?',
    options: [
      'To record the outcome of the call',
      'To transfer the call to another agent',
      'To end the call immediately',
      'To schedule a callback'
    ],
    correct_answer: 0,
    question_order: 4
  },
  {
    id: '4-5',
    module_id: '4',
    question: "When do you need to manually end a call in the AI Dialer system?",
    options: [
      'After every call',
      'Only when the call is disconnected unexpectedly',
      "When the call result doesn't automatically end the call",
      'When you switch to Break mode'
    ],
    correct_answer: 2,
    question_order: 5
  },
  
  // Module 5: Lead Management
  {
    id: '5-1',
    module_id: '5',
    question: 'What are the two main sections of lead information displayed in the workspace?',
    options: [
      'Basic Info and Advanced Info',
      'Contact Information and Lead Details',
      'Name/Phone and Address/Email',
      'Primary Data and Secondary Data'
    ],
    correct_answer: 1,
    question_order: 1
  },
  {
    id: '5-2',
    module_id: '5',
    question: 'How can you update incorrect lead information during a call?',
    options: [
      'Submit a correction request to your manager',
      'Click directly into the field and type the new information',
      'Create a new lead profile with the correct information',
      'You cannot update information during a call'
    ],
    correct_answer: 1,
    question_order: 2
  },
  {
    id: '5-3',
    module_id: '5',
    question: "What type of information can you find in the Contact History tab?",
    options: [
      "The lead's credit score and financial history",
      'Previous interactions with this lead and notes',
      "The lead's purchase history with competitors",
      "The lead's social media activity"
    ],
    correct_answer: 1,
    question_order: 3
  },
  {
    id: '5-4',
    module_id: '5',
    question: "Which folder contains lead profiles for callbacks you've scheduled?",
    options: [
      'Recent Folders',
      'Shared Files',
      'My Files',
      'Callback Queue'
    ],
    correct_answer: 2,
    question_order: 4
  },
  
  // Module 6: Callback Management
  {
    id: '6-1',
    module_id: '6',
    question: 'Which method should you use to book a callback for a specific time, like Monday at 10am?',
    options: [
      'The Callback Time drop-down menu',
      'The Appointment Calendar',
      'The Quick Callback feature',
      'The Scheduling Assistant'
    ],
    correct_answer: 1,
    question_order: 1
  },
  {
    id: '6-2',
    module_id: '6',
    question: 'To access the Appointment Calendar, what must you check?',
    options: [
      'The Use calendar checkbox',
      'The Schedule Meeting option',
      'The Manual Callback setting',
      'The Time Zone Adjustment feature'
    ],
    correct_answer: 0,
    question_order: 2
  },
  {
    id: '6-3',
    module_id: '6',
    question: 'What Agent Dialer setting would enable the system to call your callbacks automatically at the scheduled time?',
    options: [
      'Call manually',
      'Auto dial on time',
      'Auto dial callback',
      'Scheduled dialing'
    ],
    correct_answer: 1,
    question_order: 3
  },
  {
    id: '6-4',
    module_id: '6',
    question: 'How do you reschedule a callback appointment?',
    options: [
      'Delete the original appointment and create a new one',
      'Open the Lead, select the Call Result, choose a new time, and submit',
      'Email the support team to change the time',
      'Use the Reschedule button in Calendar view'
    ],
    correct_answer: 1,
    question_order: 4
  },
  {
    id: '6-5',
    module_id: '6',
    question: 'What views are available in the Callback Calendar? (Select the BEST answer)',
    options: [
      'Day view only',
      'Day, Week and Month views',
      'Day, Week, Month, and Year views',
      'Only Calendar view'
    ],
    correct_answer: 1,
    question_order: 5
  },
  
  // Module 7: Call Handling Tools
  {
    id: '7-1',
    module_id: '7',
    question: 'How do you access the Dial Pad in ReadyMode?',
    options: [
      'Click on the Phone icon in the top toolbar',
      'Hover over the Phone Status message in the lower right',
      'Press the keyboard shortcut Ctrl+D',
      'Open the Tools menu and select Dial Pad'
    ],
    correct_answer: 1,
    question_order: 1
  },
  {
    id: '7-2',
    module_id: '7',
    question: 'What is the difference between a Warm Transfer and a Cold Transfer?',
    options: [
      'Warm Transfer is for internal calls, Cold Transfer is for external calls',
      'Warm Transfer allows private consultation before transferring, Cold Transfer is immediate',
      'Warm Transfer is for managers, Cold Transfer is for other agents',
      'Warm Transfer requires approval, Cold Transfer is automatic'
    ],
    correct_answer: 1,
    question_order: 2
  },
  {
    id: '7-3',
    module_id: '7',
    question: 'To merge calls and create a conference call, what button must you click after dialing the third party?',
    options: [
      'Conference',
      'Join',
      'Merge',
      'Connect'
    ],
    correct_answer: 2,
    question_order: 3
  },
];

export const useAdditionalTrainingData = () => {
  return {
    modules: additionalTrainingModules,
    questions: additionalTrainingQuestions
  };
};
