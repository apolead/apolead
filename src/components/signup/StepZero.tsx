
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const StepZero = ({
  userData,
  updateUserData,
  nextStep,
  isCheckingEmail = false
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleBackToHome = async (e) => {
    e.preventDefault();
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        if (!mounted) return;
        setIsCheckingSession(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          console.log("User is authenticated:", session.user);
          
          try {
            // Use simple select without RLS dependencies
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('application_status, first_name, credentials')
              .eq('user_id', session.user.id)
              .maybeSingle();
              
            if (profileError) {
              console.error("Error fetching profile:", profileError);
              setErrorMessage('Error fetching profile, continuing with signup flow');
              
              if (mounted) {
                updateUserData({
                  email: session.user.email,
                  firstName: session.user.user_metadata?.first_name || '',
                  lastName: session.user.user_metadata?.last_name || ''
                });
                
                setTimeout(() => {
                  if (mounted) {
                    nextStep();
                    setIsCheckingSession(false);
                  }
                }, 500);
              }
            } else if (!profile) {
              console.log("No profile found, creating initial profile");
              
              if (mounted) {
                updateUserData({
                  email: session.user.email,
                  firstName: session.user.user_metadata?.first_name || '',
                  lastName: session.user.user_metadata?.last_name || ''
                });
                
                try {
                  const { error: insertError } = await supabase
                    .from('user_profiles')
                    .insert({
                      user_id: session.user.id,
                      email: session.user.email,
                      first_name: session.user.user_metadata?.first_name || '',
                      last_name: session.user.user_metadata?.last_name || '',
                      application_status: 'pending',
                      credentials: 'agent'
                    });
                    
                  if (insertError) {
                    console.error("Error creating initial profile:", insertError);
                  }
                } catch (err) {
                  console.error("Error in profile creation:", err);
                }
                
                setTimeout(() => {
                  if (mounted) {
                    nextStep();
                    setIsCheckingSession(false);
                  }
                }, 500);
              }
            } else if (profile.application_status === 'rejected') {
              toast({
                title: "Application Rejected",
                description: "Unfortunately, your application didn't meet our qualifications.",
                variant: "destructive",
              });
              await supabase.auth.signOut();
              setIsCheckingSession(false);
            } else if (profile.application_status === 'approved') {
              toast({
                title: "Welcome back!",
                description: "You've been redirected to your dashboard",
              });
              
              if (profile.credentials === 'supervisor') {
                navigate('/supervisor');
              } else {
                navigate('/dashboard');
              }
            } else {
              // If profile exists but not approved, continue with signup
              updateUserData({
                email: session.user.email,
                firstName: profile.first_name || '',
                lastName: profile.last_name || ''
              });
              
              setTimeout(() => {
                if (mounted) {
                  nextStep();
                  setIsCheckingSession(false);
                }
              }, 500);
            }
          } catch (error) {
            console.error("Error in profile handling:", error);
            setIsCheckingSession(false);
          }
        } else if (mounted) {
          console.log("No authenticated user found");
          setIsCheckingSession(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        if (mounted) {
          setIsCheckingSession(false);
        }
      }
    };
    
    // First set up the auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (!mounted) return;
        
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session && mounted) {
          // Handle new sign in
          updateUserData({
            email: session.user.email,
            firstName: session.user.user_metadata?.first_name || '',
            lastName: session.user.user_metadata?.last_name || ''
          });
          
          try {
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('application_status, credentials')
              .eq('user_id', session.user.id)
              .maybeSingle();
              
            if (profileError) {
              console.error("Error checking profile after sign in:", profileError);
              setTimeout(() => {
                if (mounted) nextStep();
              }, 500);
              return;
            }
              
            if (!profile) {
              console.log("No profile found after sign in, continuing to next step");
              setTimeout(() => {
                if (mounted) nextStep();
              }, 500);
            } else if (profile.application_status === 'rejected') {
              toast({
                title: "Application Rejected",
                description: "Unfortunately, your application didn't meet our qualifications.",
                variant: "destructive",
              });
              await supabase.auth.signOut();
            } else if (profile.application_status === 'approved') {
              toast({
                title: "Login successful!",
                description: "Welcome back!",
              });
              
              // Redirect based on credentials
              if (profile.credentials === 'supervisor') {
                navigate('/supervisor');
              } else {
                navigate('/dashboard');
              }
            } else {
              // If pending, continue with signup
              setTimeout(() => {
                if (mounted) nextStep();
              }, 500);
            }
          } catch (error) {
            console.error("Error in auth state change handler:", error);
            setTimeout(() => {
              if (mounted) nextStep();
            }, 500);
          }
        }
      }
    );
    
    // Then check the current session
    checkSession();
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, nextStep, updateUserData, toast]);
  
  const validateEmail = (email) => {
    // Check if email ends with @gmail.com
    return email.toLowerCase().endsWith('@gmail.com');
  };
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Validate all fields are filled
      if (!email || !password || !firstName || !lastName) {
        setErrorMessage('Please fill in all fields');
        setIsLoading(false);
        return;
      }
      
      // Validate email is a Gmail address
      if (!validateEmail(email)) {
        setErrorMessage('Please use a Gmail address (@gmail.com)');
        setIsLoading(false);
        return;
      }
      
      // Register user with email and password
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      if (error) throw error;
      
      toast({
        title: "Signup successful",
        description: "Please check your email for verification",
      });
      
      updateUserData({
        email,
        firstName,
        lastName
      });
      
      // The auth state change listener will handle the rest
      console.log("Sign up initiated, awaiting email verification");
      
    } catch (error) {
      console.error('Error signing up:', error);
      setErrorMessage(error.message || 'Failed to sign up');
      toast({
        title: "Sign up failed",
        description: error.message || "Failed to sign up",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      <div className="w-full md:w-1/2 bg-[#1A1F2C] text-white relative p-8 md:p-16 flex flex-col justify-between overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00c2cb] opacity-10 rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600 opacity-10 rounded-full translate-y-1/3 -translate-x-1/3"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-[#00c2cb] opacity-5 rotate-45"></div>
        
        <div className="relative z-10">
          <a 
            href="#" 
            onClick={handleBackToHome} 
            className="inline-flex items-center text-white hover:text-white/80 mb-12"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </a>

          <h2 className="text-3xl font-bold mb-6 text-white">Let us help you run your call center career.</h2>
          <p className="text-white/80">Our registration process is quick and easy, taking no more than 10 minutes to complete.</p>
        </div>
        
        <div className="mt-auto relative z-10">
          <div className="bg-indigo-800 bg-opacity-70 rounded-lg p-5 mb-8">
            <p className="text-sm italic mb-3 text-white">"I'm impressed with how quickly I've seen progress since starting to use this platform. I began receiving clients and projects in the first week."</p>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center text-white font-bold mr-2">
                J
              </div>
              <div>
                <p className="text-xs font-semibold text-white">James Kim</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-indigo-500 pt-4 text-sm italic">
            <p className="text-white">"If you can build a great experience, customers will come back after their first call. Word of mouth is very powerful!"</p>
            <p className="mt-2 font-semibold text-white">— Alex W.</p>
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 flex flex-col">
        <div className="block md:hidden mb-8">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
      
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold inline">
              <span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span>
            </h2>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-center">Get started</h1>
          <p className="text-gray-600 mb-8 text-center">Create your account now</p>
          
          {isCheckingSession ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
              <p className="text-gray-600">Checking login status...</p>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      type="text" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      type="text" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Gmail only)</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="youremail@gmail.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing up...
                    </div>
                  ) : (
                    "Sign up"
                  )}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm">
                  Have an account? <Link to="/login" className="text-indigo-600 hover:underline">Login</Link>
                </p>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">Only Gmail accounts are accepted</p>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-auto pt-4">
          <p className="text-center text-gray-500 text-xs">© 2025 ApoLead, All rights Reserved</p>
        </div>
      </div>
    </div>
  );
};

export default StepZero;
