
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, ChevronLeft, ChevronRight, FileText, Image } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const SupervisorDashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedImageType, setSelectedImageType] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [interviewNotes, setInterviewNotes] = useState('');
  const [salesSkillRating, setSalesSkillRating] = useState('');
  const [communicationRating, setCommunicationRating] = useState('');
  const [interviewStatus, setInterviewStatus] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Session found:", session.user.id);
          setCurrentUser(session.user);
          
          // Fetch profile data for the logged-in user
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile data:", profileError);
            throw profileError;
          }
          
          if (profileData) {
            console.log("Profile data found:", profileData);
            setProfileData(profileData);
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        
        // Fetch all user profiles that have credentials = 'agent'
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('credentials', 'agent');
          
        if (error) {
          console.error("Error fetching agents:", error);
          throw error;
        }
        
        if (data) {
          console.log("Fetched agents:", data);
          setUsers(data);
          setFilteredUsers(data);
        }
      } catch (error) {
        console.error("Error in fetchAgents:", error);
        toast({
          title: "Error",
          description: "Failed to load agents data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgents();
  }, [toast]);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.gov_id_number && user.gov_id_number.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewImage = (url, type) => {
    if (url) {
      setSelectedImage(url);
      setSelectedImageType(type);
      setIsImageModalOpen(true);
    } else {
      toast({
        title: "Image Not Available",
        description: `No ${type} image uploaded for this user.`,
        variant: "destructive",
      });
    }
  };

  const handleOpenActionModal = (user) => {
    setSelectedUser(user);
    setInterviewNotes('');
    setSalesSkillRating('');
    setCommunicationRating('');
    setInterviewStatus('');
    setIsActionModalOpen(true);
  };

  const handleSaveInterview = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          supervisor_notes: interviewNotes,
          sales_skills_rating: salesSkillRating,
          communication_rating: communicationRating,
          application_status: interviewStatus || selectedUser.application_status,
        })
        .eq('id', selectedUser.id);

      if (error) {
        throw error;
      }

      // Update local state
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            supervisor_notes: interviewNotes,
            sales_skills_rating: salesSkillRating,
            communication_rating: communicationRating,
            application_status: interviewStatus || user.application_status,
          };
        }
        return user;
      });

      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);

      toast({
        title: "Success",
        description: "Interview information updated successfully",
      });

      setIsActionModalOpen(false);
    } catch (error) {
      console.error("Error saving interview data:", error);
      toast({
        title: "Error",
        description: "Failed to save interview information",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">
            Supervisor Dashboard
          </CardTitle>
          <CardDescription>
            Welcome back, {profileData ? `${profileData.first_name} ${profileData.last_name}` : 'Supervisor'}
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div className="flex items-center">
              <span className="text-purple-600 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </span>
              <h2 className="text-xl font-bold">Interview Candidates</h2>
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mt-4 md:mt-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search by name, ID, or status..."
                  className="pl-8 w-full md:w-[300px]"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                New Interview
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent Name</TableHead>
                  <TableHead>Government ID</TableHead>
                  <TableHead>Gov Photo</TableHead>
                  <TableHead>Speed Test</TableHead>
                  <TableHead>Sales Skills</TableHead>
                  <TableHead>Communication</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex justify-center">
                        <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.gov_id_number || 'N/A'}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewImage(user.gov_id_image, 'Government ID')}
                          disabled={!user.gov_id_image}
                        >
                          <Image className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewImage(user.speed_test, 'Speed Test')}
                          disabled={!user.speed_test}
                        >
                          <Image className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                      <TableCell>{user.sales_skills_rating || 'Not Rated'}</TableCell>
                      <TableCell>{user.communication_rating || 'Not Rated'}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.application_status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : user.application_status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {user.application_status ? 
                            user.application_status.charAt(0).toUpperCase() + user.application_status.slice(1) 
                            : 'Pending'
                          }
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenActionModal(user)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Interview
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Search className="h-10 w-10 mb-2" />
                        <p>No candidates found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {filteredUsers.length > 0 ? 1 : 0} to {filteredUsers.length} of {filteredUsers.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm mr-2">Show</span>
              <Select value="7">
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="7" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm ml-2">entries</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="bg-indigo-600 text-white">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedImageType} Preview</DialogTitle>
            <DialogDescription>
              Uploaded document for verification
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4 bg-gray-100 rounded-md">
            <img 
              src={selectedImage} 
              alt={selectedImageType} 
              className="max-h-[70vh] object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
              }}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setIsImageModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interview Action Modal */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Interview Notes</DialogTitle>
            <DialogDescription>
              {selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : 'Candidate'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="interview-notes">Interview Notes</Label>
              <Textarea
                id="interview-notes"
                placeholder="Enter your notes about the interview..."
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sales-skills">Sales Skills</Label>
                <Select value={salesSkillRating} onValueChange={setSalesSkillRating}>
                  <SelectTrigger id="sales-skills">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Poor">Poor</SelectItem>
                    <SelectItem value="Average">Average</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="communication">Communication</Label>
                <Select value={communicationRating} onValueChange={setCommunicationRating}>
                  <SelectTrigger id="communication">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Poor">Poor</SelectItem>
                    <SelectItem value="Average">Average</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Application Status</Label>
              <Select value={interviewStatus} onValueChange={setInterviewStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveInterview}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupervisorDashboard;
