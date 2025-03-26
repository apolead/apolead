
import React from 'react';
import { 
  Popover,
  PopoverTrigger,
  PopoverContent 
} from "@/components/ui/popover";
import { HelpCircle } from 'lucide-react';

const SupportFAQ = () => {
  return (
    <Popover>
      <PopoverTrigger className="flex items-center text-sm text-gray-700 hover:text-indigo-600 transition-colors">
        <HelpCircle className="mr-2 h-4 w-4" /> Support Center
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4 max-h-96 overflow-y-auto" align="center">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Support Center FAQ</h3>
          
          <div>
            <h4 className="font-medium text-sm text-indigo-700">How long does the onboarding process take?</h4>
            <p className="text-sm mt-1">The entire onboarding process typically takes a few days to complete. Each step is important to ensure you're fully prepared to succeed.</p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-indigo-700">When will my interview be scheduled?</h4>
            <p className="text-sm mt-1">After you complete the initial training, our team will review your progress and schedule an interview within 1-2 business days.</p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-indigo-700">What happens during the interview?</h4>
            <p className="text-sm mt-1">The interview is a chance for us to get to know you better and assess your understanding of the initial training. It typically lasts 20-30 minutes.</p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-indigo-700">How do I unlock the next steps?</h4>
            <p className="text-sm mt-1">Each step unlocks sequentially as you complete the previous one. You must complete all training modules and assessments to progress.</p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-indigo-700">What score do I need to pass the assessments?</h4>
            <p className="text-sm mt-1">You need to score at least 80% on all assessments to pass. You can retake assessments if needed.</p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-indigo-700">When can I start earning?</h4>
            <p className="text-sm mt-1">Once you've completed all onboarding steps and set up your payment information, you can start earning immediately.</p>
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">Need more help? Contact us at <a href="mailto:support@apolead.com" className="text-indigo-600 hover:underline">support@apolead.com</a></p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SupportFAQ;
