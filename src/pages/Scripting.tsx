
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const scripts = [
  {
    id: 1,
    type: "Hard Sell",
    company: "Credit Saint",
    title: "Credit Repair - Hard Sell",
    content: `Opening\nHi [first name], this is [your first name] on a recorded line with Credit Coach...`,
  },
  {
    id: 2,
    type: "Soft Sell",
    company: "Credit Saint",
    title: "Credit Repair - Soft Sell",
    content: `Opening\nHello [first name], my name is [your first name], and I'm calling from Credit Coach...`,
  }
];

const Scripting = () => {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScript, setSelectedScript] = useState<typeof scripts[0] | null>(null);

  // Check if user has proper access
  if (!userProfile || !['probation', 'agent'].includes(userProfile.agent_standing || '')) {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredScripts = scripts.filter(script => 
    script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Scripting Resources</h1>
      
      <div className="relative w-full max-w-sm mb-6">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search scripts..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScripts.map((script) => (
          <Card 
            key={script.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedScript(script)}
          >
            <CardHeader>
              <CardTitle className="flex flex-col gap-1">
                <span className="text-lg">{script.type}</span>
                <span className="text-sm text-muted-foreground">{script.company}</span>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedScript} onOpenChange={() => setSelectedScript(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedScript?.title}</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-line">
            {selectedScript?.content}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Scripting;
