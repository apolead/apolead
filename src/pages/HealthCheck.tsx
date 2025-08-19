import React from 'react';
import { HealthCheck as HealthCheckComponent } from '@/components/qa/HealthCheck';
import { QATestSuite } from '@/components/qa/QATestSuite';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const HealthCheck: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">System Quality Assurance</h1>
            <p className="text-muted-foreground text-lg">
              Comprehensive health monitoring and automated testing for the platform
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <HealthCheckComponent />
            <QATestSuite />
          </div>
          
          <div className="mt-8 p-4 border rounded-lg bg-muted/50">
            <h2 className="text-xl font-semibold mb-4">Manual Testing Checklist</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-medium mb-2">🔓 Public Routes</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>✓ Home page (/)</li>
                  <li>✓ Login page (/login)</li>
                  <li>✓ Signup page (/signup)</li>
                  <li>✓ Partners page (/partners)</li>
                  <li>✓ Contact page (/contact)</li>
                  <li>✓ Privacy Policy (/privacy-policy)</li>
                  <li>✓ Terms of Service (/terms-of-service)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">🔒 Protected Routes</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Dashboard (/dashboard)</li>
                  <li>• Agent Management (/agents)</li>
                  <li>• Training (/training)</li>
                  <li>• Additional Training (/additional-training)</li>
                  <li>• Supervisor Dashboard (/supervisor)</li>
                  <li>• Billing (/billing-information)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">🔐 Authentication Flows</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Email/Password Signup</li>
                  <li>• Email/Password Login</li>
                  <li>• Password Reset (recently fixed)</li>
                  <li>• Session Persistence</li>
                  <li>• Auto Logout</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">📋 Core Features</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Multi-step signup form</li>
                  <li>• File uploads (Gov ID, Speed Test, etc.)</li>
                  <li>• Training video playback</li>
                  <li>• Quiz functionality</li>
                  <li>• User profile management</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HealthCheck;