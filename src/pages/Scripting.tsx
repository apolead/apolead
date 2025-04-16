import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Search, Clipboard, Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const scripts = [
  {
    id: 1,
    type: "Hard Sell",
    company: "Credit Saint",
    title: "Credit Repair - Hard Sell",
    description: "A more direct approach for clients who need immediate credit repair solutions.",
    content: `**Opening**
Hi [first name], this is [your first name] on a recorded line with Credit Coach...

**Agent**
I'm reaching out because you recently expressed interest in improving your credit score...

**Customer**
[Wait for response]

**Agent**
Great! Let me tell you about our proven credit repair program...`,
  },
  {
    id: 2,
    type: "Soft Sell",
    company: "Credit Saint",
    title: "Credit Repair - Soft Sell",
    description: "A consultative approach focusing on understanding client needs first.",
    content: `**Opening**
Hello [first name], my name is [your first name], and I'm calling from Credit Coach...

**Agent**
I understand you're looking to learn more about credit improvement options...

**Customer**
[Wait for response]

**Agent**
Thank you for sharing that. Let me explain how we might be able to help...`,
  }
];

const Scripting = () => {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScript, setSelectedScript] = useState<typeof scripts[0] | null>(null);

  const filteredScripts = scripts.filter(script => 
    script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const initials = userProfile?.first_name && userProfile?.last_name
    ? `${userProfile.first_name[0]}${userProfile.last_name[0]}`
    : 'U';

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar activeItem="scripting" />
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <div className="border-b">
          <div className="flex h-16 items-center px-4 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">Scripting</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="size-8 flex items-center justify-center rounded-full hover:bg-accent">
                <Search className="h-5 w-5" />
              </button>
              <button className="size-8 flex items-center justify-center rounded-full hover:bg-accent">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {userProfile?.first_name} {userProfile?.last_name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <div className="relative w-full max-w-sm mb-8">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scripts..."
                className="pl-10 bg-card border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Scripts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredScripts.map((script) => (
                <Card 
                  key={script.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow bg-card hover:bg-accent/5"
                  onClick={() => setSelectedScript(script)}
                >
                  <CardHeader>
                    <CardTitle className="flex flex-col gap-2">
                      <span className="text-xl text-primary">{script.type}</span>
                      <span className="text-sm text-muted-foreground">{script.company}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{script.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Dialog open={!!selectedScript} onOpenChange={() => setSelectedScript(null)}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-primary">{selectedScript?.title}</DialogTitle>
                </DialogHeader>
                <div className="whitespace-pre-line text-foreground prose prose-strong:text-primary">
                  {selectedScript?.content}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scripting;
