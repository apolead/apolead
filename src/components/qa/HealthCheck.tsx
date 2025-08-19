import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface HealthStatus {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

interface HealthChecks {
  database: HealthStatus;
  auth: HealthStatus;
  storage: HealthStatus;
  functions: HealthStatus;
}

export const HealthCheck: React.FC = () => {
  const { user } = useAuth();
  const [checks, setChecks] = useState<HealthChecks | null>(null);
  const [loading, setLoading] = useState(false);

  const runHealthChecks = async () => {
    setLoading(true);
    const results: HealthChecks = {
      database: { status: 'healthy', message: '', timestamp: new Date() },
      auth: { status: 'healthy', message: '', timestamp: new Date() },
      storage: { status: 'healthy', message: '', timestamp: new Date() },
      functions: { status: 'healthy', message: '', timestamp: new Date() }
    };

    // Test database connection
    try {
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
      if (error) throw error;
      results.database = { status: 'healthy', message: 'Database connection successful', timestamp: new Date() };
    } catch (error) {
      results.database = { status: 'error', message: `Database error: ${error}`, timestamp: new Date() };
    }

    // Test auth status
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (user && session) {
        results.auth = { status: 'healthy', message: `Authenticated as: ${user.email}`, timestamp: new Date() };
      } else {
        results.auth = { status: 'warning', message: 'Not authenticated (normal for public access)', timestamp: new Date() };
      }
    } catch (error) {
      results.auth = { status: 'error', message: `Auth error: ${error}`, timestamp: new Date() };
    }

    // Test storage buckets
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      results.storage = { status: 'healthy', message: `${data.length} storage buckets available`, timestamp: new Date() };
    } catch (error) {
      results.storage = { status: 'error', message: `Storage error: ${error}`, timestamp: new Date() };
    }

    // Test edge functions
    try {
      const { data, error } = await supabase.functions.invoke('get_application_status', {
        body: { user_id: user?.id || 'test' }
      });
      if (error && error.message.includes('permission denied')) {
        results.functions = { status: 'warning', message: 'Functions accessible (auth required for full test)', timestamp: new Date() };
      } else if (error) {
        results.functions = { status: 'error', message: `Functions error: ${error.message}`, timestamp: new Date() };
      } else {
        results.functions = { status: 'healthy', message: 'Edge functions working', timestamp: new Date() };
      }
    } catch (error) {
      results.functions = { status: 'warning', message: `Functions test inconclusive: ${error}`, timestamp: new Date() };
    }

    setChecks(results);
    setLoading(false);
  };

  useEffect(() => {
    runHealthChecks();
  }, [user]);

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: 'healthy' | 'warning' | 'error') => {
    const variants = {
      healthy: 'default',
      warning: 'secondary',
      error: 'destructive'
    } as const;
    
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  if (!checks) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Running Health Checks...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>System Health Check</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={runHealthChecks}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(checks).map(([key, check]) => (
          <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(check.status)}
              <div>
                <h3 className="font-medium capitalize">{key}</h3>
                <p className="text-sm text-muted-foreground">{check.message}</p>
                <p className="text-xs text-muted-foreground">
                  {check.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
            {getStatusBadge(check.status)}
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Quick Links</h3>
          <div className="space-y-2 text-sm">
            <div>Current Route: <code>{window.location.pathname}</code></div>
            <div>User Status: {user ? `Logged in as ${user.email}` : 'Not logged in'}</div>
            <div>Environment: Production</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};