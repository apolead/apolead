
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface StepZeroProps {
  userData: any;
  updateUserData: (data: any) => void;
  nextStep: () => void;
}

const StepZero: React.FC<StepZeroProps> = ({ userData, updateUserData, nextStep }) => {
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to continue.",
        variant: "destructive",
      });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      toast({
        title: "Invalid Email Format",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if this is a valid domain for sign up
    const isValidEmail = userData.email.includes('@') && (
      userData.email.endsWith('@gmail.com') || 
      userData.email.endsWith('@outlook.com') || 
      userData.email.endsWith('@hotmail.com') || 
      userData.email.endsWith('@yahoo.com') ||
      userData.email.endsWith('@apolead.com')
    );
    
    if (!isValidEmail) {
      toast({
        title: "Invalid Email Domain",
        description: "Please use a supported email provider (Gmail, Outlook, Hotmail, Yahoo, or ApoLead).",
        variant: "destructive",
      });
      return;
    }
    
    // If we have a password, basic validation
    if (userData.password && userData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    // Move to next step
    nextStep();
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Create Your Account</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={userData.email || ''}
                onChange={(e) => updateUserData({ email: e.target.value })}
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={userData.password || ''}
                onChange={(e) => updateUserData({ password: e.target.value })}
                className="w-full"
              />
            </div>
            
            <button
              type="submit" 
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">Gmail, Outlook, Hotmail, Yahoo, and ApoLead email accounts are supported</p>
        </div>
      </div>
    </div>
  );
};

export default StepZero;
