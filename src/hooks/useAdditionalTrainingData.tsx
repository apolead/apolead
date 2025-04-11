
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProbationTrainingModule, ProbationTrainingQuestion } from '@/types/probation-training';

export const useAdditionalTrainingData = () => {
  const [modules, setModules] = useState<ProbationTrainingModule[]>([]);
  const [questions, setQuestions] = useState<Record<string, ProbationTrainingQuestion[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('probation_training_modules')
        .select('*')
        .order('module_order', { ascending: true });

      if (error) throw error;

      if (data) {
        console.log("Loaded training modules:", data);
        
        // Create dummy modules if none exist yet
        if (data.length === 0) {
          const dummyModules = createDummyModules();
          setModules(dummyModules);
          
          // Also create dummy questions for each module
          const questionMap: Record<string, ProbationTrainingQuestion[]> = {};
          dummyModules.forEach(module => {
            questionMap[module.id] = createDummyQuestions(module.id, module.title);
          });
          setQuestions(questionMap);
        } else {
          setModules(data as ProbationTrainingModule[]);
          
          // Load all questions for all modules at once
          for (const module of data) {
            await loadQuestionsForModule(module.id);
          }
        }
      }
    } catch (err) {
      console.error("Error loading training modules:", err);
      setError("Failed to load training modules");
      
      // Use dummy data as fallback
      const dummyModules = createDummyModules();
      setModules(dummyModules);
      
      const questionMap: Record<string, ProbationTrainingQuestion[]> = {};
      dummyModules.forEach(module => {
        questionMap[module.id] = createDummyQuestions(module.id, module.title);
      });
      setQuestions(questionMap);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionsForModule = async (moduleId: string) => {
    try {
      const { data, error } = await supabase
        .from('probation_training_questions')
        .select('*')
        .eq('module_id', moduleId)
        .order('question_order', { ascending: true });

      if (error) throw error;

      if (data) {
        console.log(`Loaded questions for module ${moduleId}:`, data);
        
        // Make sure all modules have dummy questions, even the first introduction module
        if (data.length === 0) {
          const module = modules.find(m => m.id === moduleId);
          if (module) {
            // Always create at least one dummy question for every module
            // For module 1, we'll make sure it has proper questions too
            const dummyQuestions = createDummyQuestions(moduleId, module.title);
            setQuestions(prev => ({
              ...prev,
              [moduleId]: dummyQuestions
            }));
          }
        } else {
          setQuestions(prev => ({
            ...prev,
            [moduleId]: data as ProbationTrainingQuestion[]
          }));
        }
      }
    } catch (err) {
      console.error(`Error loading questions for module ${moduleId}:`, err);
      
      // Use dummy questions as fallback
      const module = modules.find(m => m.id === moduleId);
      if (module) {
        const dummyQuestions = createDummyQuestions(moduleId, module.title);
        setQuestions(prev => ({
          ...prev,
          [moduleId]: dummyQuestions
        }));
      }
    }
  };

  const createDummyModules = (): ProbationTrainingModule[] => {
    return [
      {
        id: '1',
        title: 'Introduction Module',
        description: 'ReadyMode is a powerful platform designed to help you connect with leads efficiently and effectively.',
        video_url: 'https://youtu.be/nejx5KiN-ro',
        module_order: 1
      },
      {
        id: '2',
        title: 'ReadyMode Navigation Basics',
        description: 'Learn how to navigate the ReadyMode interface and understand its key components.',
        video_url: 'https://youtu.be/p84R6ZiKQkk',
        module_order: 2
      },
      {
        id: '3',
        title: 'Availability & Status Management',
        description: 'Learn how to manage your availability status in ReadyMode to control call flow.',
        video_url: 'https://youtu.be/c1Z1W50ydLA',
        module_order: 3
      },
      {
        id: '4',
        title: 'AI Dialer Operations',
        description: 'Understand how the AI Dialer works and how to handle calls effectively.',
        video_url: 'https://youtu.be/BvP3d__2M2w',
        module_order: 4
      },
      {
        id: '5',
        title: 'Lead Management',
        description: 'Learn how to manage leads and their information in ReadyMode.',
        video_url: 'https://youtu.be/0AJKAOiEq84',
        module_order: 5
      },
      {
        id: '6',
        title: 'Callback Management',
        description: 'Master the process of scheduling and managing callbacks in ReadyMode.',
        video_url: 'https://youtu.be/UWE7KTr0uaM',
        module_order: 6
      },
      {
        id: '7',
        title: 'Call Handling Tools',
        description: 'Learn about the various call handling tools available in ReadyMode.',
        video_url: 'https://youtu.be/CmGKIy_hg3A',
        module_order: 7
      },
      {
        id: '8',
        title: 'Conclusion',
        description: 'Wrap up and review of all ReadyMode features learned in the training.',
        video_url: 'https://youtu.be/TAjKRbP9eRU',
        module_order: 8
      }
    ];
  };

  const createDummyQuestions = (moduleId: string, moduleTitle: string): ProbationTrainingQuestion[] => {
    switch (moduleId) {
      case '1': // Introduction - Add dummy questions to make it consistent
        return [
          {
            id: `q1-1`,
            question: "What is the primary purpose of ReadyMode?",
            options: [
              "To manage inventory",
              "To connect with leads efficiently", 
              "To track employee hours",
              "To process payments"
            ],
            correct_answer: 1,
            module_id: moduleId,
            question_order: 1
          },
          {
            id: `q1-2`,
            question: "Which of the following best describes ReadyMode?",
            options: [
              "A word processing software",
              "A customer relationship management tool",
              "A lead management and communication platform", 
              "A spreadsheet application"
            ],
            correct_answer: 2,
            module_id: moduleId,
            question_order: 2
          },
          {
            id: `q1-3`,
            question: "What does ReadyMode help businesses do?",
            options: [
              "Create websites",
              "Manage social media",
              "Connect with potential customers", 
              "Process payments"
            ],
            correct_answer: 2,
            module_id: moduleId,
            question_order: 3
          }
        ];
      case '2': // Navigation Basics
        return [
          {
            id: `q2-1`,
            question: "What are the four main navigation areas in ReadyMode?",
            options: [
              "Dashboard, Side Navigation, Center Panel, and Status Bar",
              "Dashboard, Top Navigation, Workspace, and Bottom Navigation", 
              "Main Menu, Quick Access, Display Area, and Settings",
              "Home, Search, Reports, and Settings"
            ],
            correct_answer: 1,
            module_id: moduleId,
            question_order: 1
          },
          {
            id: `q2-2`,
            question: "Where can you find your lead files in ReadyMode?",
            options: [
              "In the Reports section",
              "Under My Account",
              "In My Files under the Dashboard",
              "In the Bottom Navigation area"
            ],
            correct_answer: 2,
            module_id: moduleId,
            question_order: 2
          },
          {
            id: `q2-3`,
            question: "Which navigation area shows Callback Notifications, Folders, and Reports?",
            options: [
              "Top Navigation",
              "Workspace",
              "Dashboard", 
              "Bottom Navigation"
            ],
            correct_answer: 2,
            module_id: moduleId,
            question_order: 3
          },
          {
            id: `q2-4`,
            question: "Where is the Workspace located in the ReadyMode interface?",
            options: [
              "On the left side of the screen",
              "At the top of the screen", 
              "In the center of the screen",
              "At the bottom of the screen"
            ],
            correct_answer: 2,
            module_id: moduleId,
            question_order: 4
          }
        ];
      case '3': // Availability & Status Management
        return [
          {
            id: `q3-1`,
            question: "Which availability mode should you select when you're ready to take both outbound and inbound calls?",
            options: [
              "Prep Work",
              "Break",
              "Ready",
              "Inbound Only"
            ],
            correct_answer: 2,
            module_id: moduleId,
            question_order: 1
          },
          {
            id: `q3-2`,
            question: "What happens when you switch to 'Ready' mode?",
            options: [
              "The system pauses all calls",
              "You receive only inbound calls",
              "The dialer activates and begins connecting calls",
              "Your status is hidden from managers"
            ],
            correct_answer: 2,
            module_id: moduleId,
            question_order: 2
          },
          {
            id: `q3-3`,
            question: "When you first log into ReadyMode, which mode is automatically selected?",
            options: [
              "Ready",
              "Prep Work",
              "Break",
              "Last Call"
            ],
            correct_answer: 1,
            module_id: moduleId,
            question_order: 3
          },
          {
            id: `q3-4`,
            question: "True or False: You can select Prep Work mode again after you've changed to a different mode during the day.",
            options: [
              "True",
              "False"
            ],
            correct_answer: 1,
            module_id: moduleId,
            question_order: 4
          }
        ];
      case '4': // AI Dialer Operations
        return [
          {
            id: `q4-1`,
            question: "What happens when the AI Dialer connects with a lead who answers?",
            options: [
              "You hear a beep and see the lead's information on your screen",
              "The call goes to voicemail automatically",
              "You must manually accept the call",
              "The call is transferred to your manager"
            ],
            correct_answer: 0,
            module_id: moduleId,
            question_order: 1
          },
          {
            id: `q4-2`,
            question: "What is the correct sequence for handling a call with the AI Dialer?",
            options: [
              "Answer Call → End Call → Handle Call → Disposition Call → Switch to Ready",
              "Switch to Ready → Answer Call → Handle Call → Disposition Call → End Call",
              "Switch to Ready → Handle Call → Answer Call → End Call → Disposition Call",
              "Answer Call → Switch to Ready → Handle Call → Disposition Call → End Call"
            ],
            correct_answer: 1,
            module_id: moduleId,
            question_order: 2
          },
          {
            id: `q4-3`,
            question: "If you need to take a short break during your shift, which availability mode should you select?",
            options: [
              "Last Call",
              "Break", 
              "Inbound Only",
              "Prep Work"
            ],
            correct_answer: 1,
            module_id: moduleId,
            question_order: 3
          },
          {
            id: `q4-4`,
            question: "What is the purpose of call dispositioning?",
            options: [
              "To record the outcome of the call",
              "To transfer the call to another agent",
              "To end the call immediately",
              "To schedule a callback"
            ],
            correct_answer: 0,
            module_id: moduleId,
            question_order: 4
          },
          {
            id: `q4-5`,
            question: "When do you need to manually end a call in the AI Dialer system?",
            options: [
              "After every call",
              "Only when the call is disconnected unexpectedly",
              "When the call result doesn't automatically end the call",
              "When you switch to Break mode"
            ],
            correct_answer: 2,
            module_id: moduleId,
            question_order: 5
          }
        ];
      case '5': // Lead Management
        return [
          {
            id: `q5-1`,
            question: "What are the two main sections of lead information displayed in the workspace?",
            options: [
              "Basic Info and Advanced Info",
              "Contact Information and Lead Details",
              "Name/Phone and Address/Email",
              "Primary Data and Secondary Data"
            ],
            correct_answer: 1,
            module_id: moduleId,
            question_order: 1
          },
          {
            id: `q5-2`,
            question: "How can you update incorrect lead information during a call?",
            options: [
              "Submit a correction request to your manager",
              "Click directly into the field and type the new information",
              "Create a new lead profile with the correct information",
              "You cannot update information during a call"
            ],
            correct_answer: 1,
            module_id: moduleId,
            question_order: 2
          },
          {
            id: `q5-3`,
            question: "What type of information can you find in the Contact History tab?",
            options: [
              "The lead's credit score and financial history",
              "Previous interactions with this lead and notes",
              "The lead's purchase history with competitors",
              "The lead's social media activity"
            ],
            correct_answer: 1,
            module_id: moduleId,
            question_order: 3
          },
          {
            id: `q5-4`,
            question: "Which folder contains lead profiles for callbacks you've scheduled?",
            options: [
              "Recent Folders",
              "Shared Files",
              "My Files",
              "Callback Queue"
            ],
            correct_answer: 2,
            module_id: moduleId,
            question_order: 4
          }
        ];
      case '6': // Callback Management
        return [
          {
            id: `q6-1`,
            question: "Which method should you use to book a callback for a specific time, like Monday at 10am?",
            options: [
              "The Callback Time drop-down menu",
              "The Appointment Calendar",
              "The Quick Callback feature",
              "The Scheduling Assistant"
            ],
            correct_answer: 1,
            module_id: moduleId,
            question_order: 1
          },
          {
            id: `q6-2`,
            question: "To access the Appointment Calendar, what must you check?",
            options: [
              "The Use calendar checkbox",
              "The Schedule Meeting option",
              "The Manual Callback setting",
              "The Time Zone Adjustment feature"
            ],
            correct_answer: 0,
            module_id: moduleId,
            question_order: 2
          },
          {
            id: `q6-3`,
            question: "What Agent Dialer setting would enable the system to call your callbacks automatically at the scheduled time?",
            options: [
              "Call manually",
              "Auto dial on time",
              "Auto dial callback",
              "Scheduled dialing"
            ],
            correct_answer: 1,
            module_id: moduleId,
            question_order: 3
          },
          {
            id: `q6-4`,
            question: "How do you reschedule a callback appointment?",
            options: [
              "Delete the original appointment and create a new one",
              "Open the Lead, select the Call Result, choose a new time, and submit",
              "Email the support team to change the time",
              "Use the Reschedule button in Calendar view"
            ],
            correct_answer: 1,
            module_id: moduleId,
            question_order: 4
          },
          {
            id: `q6-5`,
            question: "What view is NOT available in the Callback Calendar?",
            options: [
              "Day view",
              "Week view",
              "Month view",
              "Year view"
            ],
            correct_answer: 3,
            module_id: moduleId,
            question_order: 5
          }
        ];
      case '7': // Call Handling Tools
        return [
          {
            id: `q7-1`,
            question: "How do you access the Dial Pad in ReadyMode?",
            options: [
              "Click on the Phone icon in the top toolbar",
              "Hover over the Phone Status message in the lower right",
              "Press the keyboard shortcut Ctrl+D",
              "Open the Tools menu and select Dial Pad"
            ],
            correct_answer: 1,
            module_id: moduleId,
            question_order: 1
          },
          {
            id: `q7-2`,
            question: "What is the difference between a Warm Transfer and a Cold Transfer?",
            options: [
              "Warm Transfer is for internal calls, Cold Transfer is for external calls",
              "Warm Transfer allows private consultation before transferring, Cold Transfer is immediate",
              "Warm Transfer is for managers, Cold Transfer is for other agents",
              "Warm Transfer requires approval, Cold Transfer is automatic"
            ],
            correct_answer: 1,
            module_id: moduleId,
            question_order: 2
          },
          {
            id: `q7-3`,
            question: "To merge calls and create a conference call, what button must you click after dialing the third party?",
            options: [
              "Conference",
              "Join",
              "Merge",
              "Connect"
            ],
            correct_answer: 2,
            module_id: moduleId,
            question_order: 3
          }
        ];
      case '8': // Conclusion
        return [
          {
            id: `q8-1`,
            question: "Which of the following is NOT a key feature of ReadyMode?",
            options: [
              "Lead Management",
              "AI Dialer",
              "Inventory Management", 
              "Callback Scheduling"
            ],
            correct_answer: 2,
            module_id: moduleId,
            question_order: 1
          },
          {
            id: `q8-2`,
            question: "What is the primary benefit of using ReadyMode's callback system?",
            options: [
              "It automatically transfers calls to managers",
              "It helps maintain connections with interested leads", 
              "It creates marketing emails",
              "It reduces the need for agents"
            ],
            correct_answer: 1,
            module_id: moduleId,
            question_order: 2
          },
          {
            id: `q8-3`,
            question: "Which ReadyMode feature allows you to see previous interactions with a lead?",
            options: [
              "Contact History", 
              "Lead Predictor",
              "Auto Scheduler",
              "Team Monitor"
            ],
            correct_answer: 0,
            module_id: moduleId,
            question_order: 3
          }
        ];
      default:
        return [];
    }
  };

  return {
    modules,
    questions,
    loading,
    error,
    loadQuestionsForModule
  };
};
