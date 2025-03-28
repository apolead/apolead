
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tables } from '@/integrations/supabase/types';

interface UserProfile extends Tables<'user_profiles'> {}

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('No user found, redirecting to login');
          navigate('/login');
          return;
        }
        
        // Check if the user is a supervisor based on their user_profiles entry
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('credentials')
          .eq('user_id', user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          navigate('/dashboard');
          return;
        }
        
        if (!profileData || (profileData.credentials !== 'supervisor' && profileData.credentials !== 'admin')) {
          console.error('Not authorized as supervisor:', profileData?.credentials);
          navigate('/dashboard');
        } else {
          console.log('User is authorized as:', profileData.credentials);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        navigate('/dashboard');
      }
    };
    
    const getUserProfiles = async () => {
      try {
        console.log('Fetching user profiles...');
        
        // Get all profiles that are not supervisors or admins and are approved
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('credentials', 'agent')
          .eq('application_status', 'approved')
          .order('application_date', { ascending: false });
        
        if (error) {
          console.error('Error fetching user profiles:', error);
          return;
        }
        
        if (data) {
          console.log('Fetched profiles:', data);
          console.log('Number of profiles fetched:', data.length);
          setUserProfiles(data);
        } else {
          console.log('No profiles data returned');
        }
      } catch (err) {
        console.error('Exception when fetching profiles:', err);
      }
    };
    
    checkUserRole();
    getUserProfiles();

    // Load Font Awesome for icons
    const script = document.createElement('script');
    script.src = 'https://kit.fontawesome.com/your-code.js';
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);

    // Load Poppins font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    setIsLoading(false);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [navigate]);

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleApproveProfile = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ application_status: 'approved' })
        .eq('user_id', userId);

      if (error) {
        console.error('Error approving profile:', error);
        return;
      }

      // Update local state
      setUserProfiles(prevProfiles => 
        prevProfiles.map(profile => 
          profile.user_id === userId 
            ? { ...profile, application_status: 'approved' } 
            : profile
        )
      );
    } catch (err) {
      console.error('Exception when approving profile:', err);
    }
  };

  const handleRejectProfile = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ application_status: 'rejected' })
        .eq('user_id', userId);

      if (error) {
        console.error('Error rejecting profile:', error);
        return;
      }

      // Update local state
      setUserProfiles(prevProfiles => 
        prevProfiles.map(profile => 
          profile.user_id === userId 
            ? { ...profile, application_status: 'rejected' } 
            : profile
        )
      );
    } catch (err) {
      console.error('Exception when rejecting profile:', err);
    }
  };
  
  // Filter profiles based on search term
  const filteredProfiles = userProfiles.filter(profile => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    if (lowerSearchTerm.includes('approved')) {
      return profile.application_status?.toLowerCase() === 'approved';
    }
    
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.toLowerCase();
    
    return (
      fullName.includes(lowerSearchTerm) || 
      (profile.gov_id_number?.toLowerCase() || '').includes(lowerSearchTerm) ||
      (profile.application_status?.toLowerCase() || '').includes(lowerSearchTerm) ||
      (profile.email?.toLowerCase() || '').includes(lowerSearchTerm)
    );
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status: string | null) => {
    if (!status) return 'bg-gray-500';
    
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Supervisor Dashboard</h1>
      
      <div className="mb-6">
        <Input
          placeholder="Search by name, ID, status, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Applications</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>ID Number</TableHead>
                    <TableHead>Application Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.length > 0 ? (
                    filteredProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{profile.first_name?.[0]}{profile.last_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{profile.first_name} {profile.last_name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>{profile.gov_id_number || 'N/A'}</TableCell>
                        <TableCell>{formatDate(profile.application_date)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusClass(profile.application_status)}>
                            {profile.application_status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewProfile(profile.user_id)}
                            >
                              View
                            </Button>
                            {profile.application_status !== 'approved' && (
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleApproveProfile(profile.user_id)}
                              >
                                Approve
                              </Button>
                            )}
                            {profile.application_status !== 'rejected' && (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleRejectProfile(profile.user_id)}
                              >
                                Reject
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No applications found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>ID Number</TableHead>
                    <TableHead>Application Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userProfiles
                    .filter(profile => profile.application_status === 'pending')
                    .map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{profile.first_name?.[0]}{profile.last_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{profile.first_name} {profile.last_name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>{profile.gov_id_number || 'N/A'}</TableCell>
                        <TableCell>{formatDate(profile.application_date)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewProfile(profile.user_id)}
                            >
                              View
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleApproveProfile(profile.user_id)}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleRejectProfile(profile.user_id)}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>ID Number</TableHead>
                    <TableHead>Application Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userProfiles
                    .filter(profile => profile.application_status === 'approved')
                    .map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{profile.first_name?.[0]}{profile.last_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{profile.first_name} {profile.last_name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>{profile.gov_id_number || 'N/A'}</TableCell>
                        <TableCell>{formatDate(profile.application_date)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewProfile(profile.user_id)}
                            >
                              View
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleRejectProfile(profile.user_id)}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>ID Number</TableHead>
                    <TableHead>Application Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userProfiles
                    .filter(profile => profile.application_status === 'rejected')
                    .map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{profile.first_name?.[0]}{profile.last_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{profile.first_name} {profile.last_name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>{profile.gov_id_number || 'N/A'}</TableCell>
                        <TableCell>{formatDate(profile.application_date)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewProfile(profile.user_id)}
                            >
                              View
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleApproveProfile(profile.user_id)}
                            >
                              Approve
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupervisorDashboard;
