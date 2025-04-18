
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const WaitlistConfirmed = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <div className="mx-auto text-center">
            <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-primary mb-2">You're on the List!</h1>
            <p className="text-muted-foreground">Thank you for your interest in ApoLead</p>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="bg-primary/5 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-primary">What happens next?</h2>
            <ul className="text-sm text-muted-foreground space-y-2 text-left list-none">
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-secondary flex-shrink-0" />
                <span>We'll review your application as soon as positions open up</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-secondary flex-shrink-0" />
                <span>You'll receive an email notification when applications reopen</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-secondary flex-shrink-0" />
                <span>Priority consideration will be given to waitlist members</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <Button asChild className="w-full bg-primary hover:bg-primary/90">
              <Link to="/">Return to Homepage</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Questions? Contact us at <a href="mailto:support@apolead.com" className="text-primary hover:underline">support@apolead.com</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitlistConfirmed;
