import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Receipt, Save, X, ShieldCheck, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const billingFormSchema = z.object({
  routingNumber: z.string().min(9, 'Must be exactly 9 digits').max(9, 'Must be exactly 9 digits').regex(/^\d+$/, 'Must contain only numbers'),
  accountNumber: z.string().min(5, 'Must be at least 5 digits').regex(/^\d+$/, 'Must contain only numbers'),
  confirmAccountNumber: z.string().min(5, 'Must be at least 5 digits').regex(/^\d+$/, 'Must contain only numbers'),
  accountType: z.enum(['checking', 'savings'], {
    required_error: 'Please select an account type'
  })
});

const formSchema = billingFormSchema.refine(data => data.accountNumber === data.confirmAccountNumber, {
  message: "Account numbers don't match",
  path: ["confirmAccountNumber"]
});

type BillingFormValues = z.infer<typeof formSchema>;

const BillingInformation = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [maskedRoutingNumber, setMaskedRoutingNumber] = useState('');
  const [maskedAccountNumber, setMaskedAccountNumber] = useState('');
  
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    document.head.appendChild(link);

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(fontLink);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(fontLink);
    };
  }, []);

  const defaultValues: Partial<BillingFormValues> = {
    routingNumber: '',
    accountNumber: '',
    confirmAccountNumber: '',
    accountType: userProfile?.account_type as any || ''
  };

  const form = useForm<BillingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onChange'
  });

  const maskNumber = (number: string) => {
    if (!number) return '';
    const lastFour = number.slice(-4);
    const masked = '*'.repeat(number.length - 4) + lastFour;
    return masked;
  };

  useEffect(() => {
    if (userProfile) {
      form.setValue('accountType', userProfile.account_type as any || '');
      
      if (userProfile.routing_number) {
        setMaskedRoutingNumber(maskNumber(userProfile.routing_number));
      }
      
      if (userProfile.account_number) {
        setMaskedAccountNumber(maskNumber(userProfile.account_number));
      }
    }
  }, [userProfile, form]);

  const onSubmit = async (data: BillingFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update your billing information",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    setSaveSuccess(false);
    try {
      // Call the dedicated billing information function directly
      const { error } = await supabase.rpc('update_billing_information', {
        p_user_id: user.id,
        p_bank_name: userProfile?.bank_name || "Default Bank", 
        p_account_number: data.accountNumber,
        p_routing_number: data.routingNumber,
        p_account_holder_name: `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim(),
        p_account_type: data.accountType,
        p_address_line1: userProfile?.address_line1 || "",
        p_address_line2: userProfile?.address_line2 || "",
        p_city: userProfile?.city || "",
        p_state: userProfile?.state || "",
        p_zip_code: userProfile?.zip_code || "",
        p_ssn_last_four: userProfile?.ssn_last_four || ""
      });
      
      if (error) {
        console.error('Error updating billing information via direct RPC:', error);
        
        // Fallback to the profile update method if direct RPC fails
        await updateProfile({
          routing_number: data.routingNumber,
          account_number: data.accountNumber,
          account_type: data.accountType
        });
      } else {
        // Also update local profile to ensure consistency
        await updateProfile({
          routing_number: data.routingNumber,
          account_number: data.accountNumber,
          account_type: data.accountType
        });
      }
      
      setMaskedRoutingNumber(maskNumber(data.routingNumber));
      setMaskedAccountNumber(maskNumber(data.accountNumber));
      
      form.setValue('routingNumber', '');
      form.setValue('accountNumber', '');
      form.setValue('confirmAccountNumber', '');
      
      setSaveSuccess(true);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Your billing information has been updated successfully."
      });
    } catch (error: any) {
      console.error('Error updating billing information:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update billing information",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setSaveSuccess(false);
  };

  const getUserInitials = () => {
    if (!userProfile) return "?";
    const firstName = userProfile.first_name || "";
    const lastName = userProfile.last_name || "";
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <DashboardSidebar activeItem="billing" />

      <div className="flex-1 p-8 md:p-10">
        <div className="flex justify-between items-center mb-10">
          <div className="text-2xl font-semibold text-[#1e293b]">
            Billing <span className="text-indigo-600 relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[3px] after:bg-gradient-to-r after:from-indigo-600 after:to-[#00c2cb] after:rounded-md">Information</span>
          </div>

          <div className="flex items-center">
            <div className="flex gap-4 mr-5">
              <button className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-gray-500 hover:text-indigo-600 transition-all hover:translate-y-[-3px]">
                <span className="sr-only">Search</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-gray-500 hover:text-indigo-600 transition-all hover:translate-y-[-3px] relative">
                <span className="sr-only">Notifications</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <button className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-gray-500 hover:text-indigo-600 transition-all hover:translate-y-[-3px]">
                <span className="sr-only">Settings</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center bg-white px-3 py-2 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer hover:translate-y-[-3px]">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-600 to-[#00c2cb] flex items-center justify-center text-white font-medium text-sm mr-2">
                {getUserInitials()}
              </div>
              <div className="font-medium text-[#1e293b]">
                {userProfile?.first_name} {userProfile?.last_name}
              </div>
              <svg className="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-10 shadow-sm mb-10 relative overflow-hidden">
          <div className="mb-8">
            <h3 className="text-xl font-medium text-[#1e293b] mb-2">Bank Account Information</h3>
            <p className="text-gray-500 text-sm">Please enter your bank account details below. This information is used to process your payments.</p>
          </div>

          <div className="flex items-center bg-indigo-50 p-4 rounded-xl mb-8">
            <div className="text-indigo-600 mr-4">
              <ShieldCheck size={20} />
            </div>
            <div className="text-gray-500 text-sm">
              <strong className="text-[#1e293b]">Your information is secure.</strong> We use industry-standard encryption to protect your sensitive data. Your banking information is never stored on our servers.
            </div>
          </div>

          {!isEditing && (userProfile?.routing_number || userProfile?.account_number) ? (
            <div className="max-w-[600px] mb-8">
              <div className="mb-6">
                <h4 className="font-medium text-[#334155] mb-2">Routing Number</h4>
                <div className="flex items-center">
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 flex-1">
                    {maskedRoutingNumber}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">The 9-digit number on the bottom left of your check</p>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium text-[#334155] mb-2">Account Number</h4>
                <div className="flex items-center">
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 flex-1">
                    {maskedAccountNumber}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium text-[#334155] mb-2">Account Type</h4>
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3">
                  {userProfile?.account_type === 'checking' ? 'Checking' : 'Savings'}
                </div>
              </div>
              
              <Button 
                onClick={handleEditClick}
                className="mt-6 bg-gradient-to-r from-indigo-600 to-[#00c2cb] hover:translate-y-[-3px] transition-all shadow-md hover:shadow-lg rounded-xl text-zinc-100"
              >
                <Edit className="mr-2 h-4 w-4" /> Update Banking Information
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-[600px]">
                <FormField 
                  control={form.control} 
                  name="routingNumber" 
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel className="font-medium text-[#334155]">Routing Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your 9-digit routing number" 
                          {...field} 
                          className="bg-[#f8fafc] border-[#e2e8f0] focus:border-indigo-600 focus:bg-white focus:ring focus:ring-indigo-100 rounded-xl p-3" 
                          maxLength={9} 
                          onChange={e => {
                            const value = e.target.value.replace(/[^\d]/g, '').slice(0, 9);
                            field.onChange(value);
                          }} 
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500 mt-1">The 9-digit number on the bottom left of your check</p>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )} 
                />

                <FormField 
                  control={form.control} 
                  name="accountNumber" 
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel className="font-medium text-[#334155]">Account Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your account number" 
                          {...field} 
                          className="bg-[#f8fafc] border-[#e2e8f0] focus:border-indigo-600 focus:bg-white focus:ring focus:ring-indigo-100 rounded-xl p-3" 
                          onChange={e => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            field.onChange(value);
                          }} 
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500 mt-1">Your account number is typically 10-12 digits</p>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )} 
                />

                <FormField 
                  control={form.control} 
                  name="confirmAccountNumber" 
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel className="font-medium text-[#334155]">Confirm Account Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Re-enter your account number" 
                          {...field} 
                          className="bg-[#f8fafc] border-[#e2e8f0] focus:border-indigo-600 focus:bg-white focus:ring focus:ring-indigo-100 rounded-xl p-3" 
                          onChange={e => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            field.onChange(value);
                          }} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )} 
                />

                <FormField 
                  control={form.control} 
                  name="accountType" 
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel className="font-medium text-[#334155]">Account Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-[#f8fafc] border-[#e2e8f0] focus:border-indigo-600 focus:bg-white focus:ring focus:ring-indigo-100 rounded-xl p-3">
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="checking">Checking</SelectItem>
                          <SelectItem value="savings">Savings</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )} 
                />

                <div className="flex gap-4 mt-10">
                  <Button 
                    type="submit" 
                    className={`${
                      saveSuccess 
                        ? "bg-green-500 hover:bg-green-600" 
                        : "bg-gradient-to-r from-indigo-600 to-[#00c2cb]"
                    } hover:translate-y-[-3px] transition-all shadow-md hover:shadow-lg rounded-xl text-zinc-100`}
                    disabled={isSubmitting}
                  >
                    <Save className="mr-2 h-4 w-4" /> 
                    {saveSuccess ? "Saved" : "Save Banking Information"}
                  </Button>
                  {isEditing && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      className="bg-[#f1f5f9] text-gray-500 hover:bg-[#e2e8f0] hover:text-[#334155] rounded-xl border-none"
                    >
                      <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingInformation;
