
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';
import { Search, Filter, Plus, Check, User, Edit } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  gov_id_number: string;
  gov_id_image: string;
  speed_test: string;
  application_date: string;
  sales_experience: boolean;
  service_experience: boolean;
  application_status: string;
  credentials: string;
  agent_id?: string;
  start_date?: string;
  agent_standing?: string;
  lead_source?: string;
  supervisor_notes?: string;
}

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProfiles, setFilteredProfiles] = useState<UserProfile[]>([]);
  
  // State for photo modals
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoType, setPhotoType] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoTitle, setPhotoTitle] = useState('');
  
  // State for interview action modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  
  // Form state
  const [agentStanding, setAgentStanding] = useState('active');
  const [leadSource, setLeadSource] = useState('');
  const [supervisorNotes, setSupervisorNotes] = useState('');
  const [agentId, setAgentId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [salesSkills, setSalesSkills] = useState('');
  const [communication, setCommunication] = useState('');
  const [interviewProcess, setInterviewProcess] = useState('');
  const [finalDecision, setFinalDecision] = useState('');

  // Fetch all user profiles that are not supervisors or admins
  useEffect(() => {
    const fetchUserProfiles = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .not('credentials', 'eq', 'supervisor')
          .not('credentials', 'eq', 'admin');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          console.log('User profiles fetched:', data);
          setUserProfiles(data);
          setFilteredProfiles(data);
        }
      } catch (error) {
        console.error('Error fetching user profiles:', error);
        toast({
          title: "Error",
          description: "Failed to load user profiles. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfiles();
  }, [toast]);

  // Handle search
  useEffect(() => {
    if (!searchQuery) {
      setFilteredProfiles(userProfiles);
      return;
    }
    
    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = userProfiles.filter(profile => 
      profile.first_name?.toLowerCase().includes(lowercaseQuery) || 
      profile.last_name?.toLowerCase().includes(lowercaseQuery) ||
      profile.email?.toLowerCase().includes(lowercaseQuery) ||
      profile.gov_id_number?.toLowerCase().includes(lowercaseQuery) ||
      profile.application_status?.toLowerCase().includes(lowercaseQuery)
    );
    
    setFilteredProfiles(filtered);
  }, [searchQuery, userProfiles]);

  // Function to open photo modal
  const openPhotoModal = (type: string, url: string, name: string) => {
    setPhotoType(type);
    setPhotoUrl(url || '');
    setPhotoTitle(type === 'id' ? 'Government ID Photo' : 'Internet Speed Test Results');
    setIsPhotoModalOpen(true);
  };

  // Function to open edit modal
  const openEditModal = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setAgentId(profile.agent_id || `AG-${Math.floor(10000 + Math.random() * 90000)}`);
    setStartDate(profile.start_date || format(new Date(), 'yyyy-MM-dd'));
    setAgentStanding(profile.agent_standing || 'active');
    setLeadSource(profile.lead_source || '');
    setSupervisorNotes(profile.supervisor_notes || '');
    setSalesSkills(profile.sales_experience ? 'Yes' : 'No');
    setCommunication('Good'); // Default value
    setInterviewProcess('Good'); // Default value
    setFinalDecision(profile.application_status || 'pending');
    setSupervisorName('Sarah Johnson'); // Current logged in supervisor
    setIsEditModalOpen(true);
  };

  // Function to save interview evaluation
  const saveInterviewEvaluation = async () => {
    if (!selectedProfile) return;
    
    try {
      // Update user profile with interview evaluation data
      const { error } = await supabase
        .from('user_profiles')
        .update({
          lead_source: leadSource,
          supervisor_notes: supervisorNotes,
          agent_standing: agentStanding,
          agent_id: agentId,
          start_date: startDate,
          application_status: finalDecision,
        })
        .eq('id', selectedProfile.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Interview evaluation saved successfully!",
      });
      
      setIsEditModalOpen(false);
      
      // Refresh user profiles
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .not('credentials', 'eq', 'supervisor')
        .not('credentials', 'eq', 'admin');
      
      if (data) {
        setUserProfiles(data);
        setFilteredProfiles(data);
      }
    } catch (error) {
      console.error('Error saving interview evaluation:', error);
      toast({
        title: "Error",
        description: "Failed to save interview evaluation. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sidebar would go here in a real implementation */}
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-semibold">Welcome, <span className="text-indigo-600">Sarah</span></h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-3">
              <Button variant="outline" size="icon" className="rounded-xl">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-xl">
                <div className="relative">
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </div>
              </Button>
              <Button variant="outline" size="icon" className="rounded-xl">
                <span className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center bg-white p-2 px-4 rounded-full shadow">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 flex items-center justify-center text-white font-semibold mr-2">
                SJ
              </div>
              <span className="font-medium text-gray-800">Sarah Johnson</span>
            </div>
          </div>
        </div>
        
        {/* Page Title */}
        <div className="flex items-center mb-8">
          <div className="h-8 w-8 rounded-md bg-gradient-to-r from-indigo-600 to-teal-500 flex items-center justify-center text-white mr-3">
            <User className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-semibold">Interview Management</h2>
          <div className="text-sm text-gray-500 ml-4 pl-4 border-l-2 border-gray-200">
            Evaluate and manage agent interviews
          </div>
        </div>
        
        {/* Table Container */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg flex items-center">
              <User className="h-5 w-5 text-indigo-600 mr-2" />
              Interview Candidates
            </h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input 
                  className="pl-10 w-[300px] bg-gray-50" 
                  placeholder="Search by name, ID, or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-teal-500">
                <Plus className="h-4 w-4" />
                New Interview
              </Button>
            </div>
          </div>
          
          {/* Data Table */}
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Agent Name</TableHead>
                <TableHead>Government ID</TableHead>
                <TableHead>Gov Photo</TableHead>
                <TableHead>Speed Test</TableHead>
                <TableHead>Application Date</TableHead>
                <TableHead>Sales Skills</TableHead>
                <TableHead>Communication</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">Loading...</TableCell>
                </TableRow>
              ) : filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">No candidates found</TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>{`${profile.first_name} ${profile.last_name}`}</TableCell>
                    <TableCell>{profile.gov_id_number || 'N/A'}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => openPhotoModal('id', profile.gov_id_image, `${profile.first_name} ${profile.last_name}`)}
                      >
                        View ID
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => openPhotoModal('speed', profile.speed_test, `${profile.first_name} ${profile.last_name}`)}
                      >
                        View Test
                      </Button>
                    </TableCell>
                    <TableCell>{formatDate(profile.application_date)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${profile.sales_experience ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {profile.sales_experience ? 'Yes' : 'No'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Good
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs 
                        ${profile.application_status === 'approved' ? 'bg-green-100 text-green-800' : 
                          profile.application_status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        <Check className="h-3 w-3 inline mr-1" />
                        {profile.application_status || 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-0"
                        onClick={() => openEditModal(profile)}
                      >
                        <Edit className="h-4 w-4 text-gray-500 hover:text-indigo-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 text-sm text-gray-500">
            <div className="flex items-center">
              Showing {filteredProfiles.length > 0 ? 1 : 0} to {filteredProfiles.length} of {userProfiles.length} entries
              <div className="flex items-center ml-6">
                <span>Show</span>
                <select className="mx-2 px-2 py-1 rounded border">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span>entries</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <i className="fas fa-chevron-left"></i>
              </Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 bg-indigo-600 text-white">1</Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">2</Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">3</Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <i className="fas fa-chevron-right"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Photo Modal */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {photoType === 'id' ? (
                <i className="fas fa-id-card"></i>
              ) : (
                <i className="fas fa-tachometer-alt"></i>
              )}
              {photoTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt={photoTitle} 
                className="max-w-full rounded-lg shadow-md" 
              />
            ) : (
              <div className="bg-gray-200 h-48 w-full rounded-lg flex items-center justify-center text-gray-500">
                No image available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Interview Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-teal-500 text-white p-4 -mx-6 -mt-6 rounded-t-lg">
              <User className="h-5 w-5" />
              Edit Interview Evaluation
            </DialogTitle>
          </DialogHeader>
          
          {selectedProfile && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Agent Name</label>
                  <Input 
                    value={`${selectedProfile.first_name} ${selectedProfile.last_name}`} 
                    readOnly 
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-1">Start Date</label>
                  <Input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-1">Sales Skills Assessment</label>
                  <div className="flex gap-4 items-center mt-2">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="sales-yes" 
                        name="sales-skills" 
                        className="mr-2" 
                        checked={salesSkills === 'Yes'} 
                        onChange={() => setSalesSkills('Yes')}
                      />
                      <label htmlFor="sales-yes">Yes</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="sales-no" 
                        name="sales-skills" 
                        className="mr-2" 
                        checked={salesSkills === 'No'} 
                        onChange={() => setSalesSkills('No')}
                      />
                      <label htmlFor="sales-no">No</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block font-medium mb-1">Communication Quality</label>
                  <div className="flex gap-4 items-center mt-2">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="comm-good" 
                        name="communication" 
                        className="mr-2" 
                        checked={communication === 'Good'} 
                        onChange={() => setCommunication('Good')}
                      />
                      <label htmlFor="comm-good">Good</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="comm-average" 
                        name="communication" 
                        className="mr-2" 
                        checked={communication === 'Average'} 
                        onChange={() => setCommunication('Average')}
                      />
                      <label htmlFor="comm-average">Average</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="comm-poor" 
                        name="communication" 
                        className="mr-2" 
                        checked={communication === 'Poor'} 
                        onChange={() => setCommunication('Poor')}
                      />
                      <label htmlFor="comm-poor">Poor</label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Agent ID</label>
                  <Input value={agentId} onChange={(e) => setAgentId(e.target.value)} />
                </div>
                
                <div>
                  <label className="block font-medium mb-1">Supervisor</label>
                  <Input value={supervisorName} readOnly />
                </div>
                
                <div>
                  <label className="block font-medium mb-1">Interview Process</label>
                  <div className="flex gap-4 items-center mt-2">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="process-good" 
                        name="interview-process" 
                        className="mr-2" 
                        checked={interviewProcess === 'Good'} 
                        onChange={() => setInterviewProcess('Good')}
                      />
                      <label htmlFor="process-good">Good</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="process-average" 
                        name="interview-process" 
                        className="mr-2" 
                        checked={interviewProcess === 'Average'} 
                        onChange={() => setInterviewProcess('Average')}
                      />
                      <label htmlFor="process-average">Average</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="process-poor" 
                        name="interview-process" 
                        className="mr-2" 
                        checked={interviewProcess === 'Poor'} 
                        onChange={() => setInterviewProcess('Poor')}
                      />
                      <label htmlFor="process-poor">Poor</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block font-medium mb-1">Final Decision</label>
                  <div className="flex gap-4 items-center mt-2">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="decision-approved" 
                        name="final-decision" 
                        className="mr-2" 
                        checked={finalDecision === 'approved'} 
                        onChange={() => setFinalDecision('approved')}
                      />
                      <label htmlFor="decision-approved">Approved</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="decision-waitlist" 
                        name="final-decision" 
                        className="mr-2" 
                        checked={finalDecision === 'waitlist'} 
                        onChange={() => setFinalDecision('waitlist')}
                      />
                      <label htmlFor="decision-waitlist">Waitlist</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="decision-rejected" 
                        name="final-decision" 
                        className="mr-2" 
                        checked={finalDecision === 'rejected'} 
                        onChange={() => setFinalDecision('rejected')}
                      />
                      <label htmlFor="decision-rejected">Rejected</label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block font-medium mb-1">Agent Standing</label>
                <div className="flex gap-4 items-center mt-2">
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="active" 
                      name="standing" 
                      className="mr-2" 
                      checked={agentStanding === 'active'} 
                      onChange={() => setAgentStanding('active')}
                    />
                    <label htmlFor="active">Active</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="probation" 
                      name="standing" 
                      className="mr-2" 
                      checked={agentStanding === 'probation'} 
                      onChange={() => setAgentStanding('probation')}
                    />
                    <label htmlFor="probation">Probation</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="warning" 
                      name="standing" 
                      className="mr-2" 
                      checked={agentStanding === 'warning'} 
                      onChange={() => setAgentStanding('warning')}
                    />
                    <label htmlFor="warning">Warning</label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block font-medium mb-1">Lead Source</label>
                <Select value={leadSource} onValueChange={setLeadSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ApexCredit">ApexCredit</SelectItem>
                    <SelectItem value="RoyalFinance">RoyalFinance</SelectItem>
                    <SelectItem value="EliteLoans">EliteLoans</SelectItem>
                    <SelectItem value="PremierBank">PremierBank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <label className="block font-medium mb-1">Supervisor Notes</label>
                <Textarea 
                  placeholder="Enter notes about this agent..." 
                  className="min-h-[120px]"
                  value={supervisorNotes}
                  onChange={(e) => setSupervisorNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 gap-2" 
              onClick={saveInterviewEvaluation}
            >
              <i className="fas fa-save"></i> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupervisorDashboard;
