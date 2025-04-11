
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, CreditCard, AlertCircle } from 'lucide-react';

const formSchema = z.object({
  accountHolderName: z.string().min(1, "Account holder name is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountType: z.string().min(1, "Account type is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  routingNumber: z.string().min(1, "Routing number is required"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "Valid ZIP code is required"),
  ssnLastFour: z.string().length(4, "Last 4 digits of SSN required")
});

type FormValues = z.infer<typeof formSchema>;

const BillingInformation = () => {
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountHolderName: userProfile?.account_holder_name || '',
      bankName: userProfile?.bank_name || '',
      accountType: userProfile?.account_type || '',
      accountNumber: userProfile?.account_number || '',
      routingNumber: userProfile?.routing_number || '',
      addressLine1: userProfile?.address_line1 || '',
      addressLine2: userProfile?.address_line2 || '',
      city: userProfile?.city || '',
      state: userProfile?.state || '',
      zipCode: userProfile?.zip_code || '',
      ssnLastFour: userProfile?.ssn_last_four || ''
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (userProfile) {
      form.reset({
        accountHolderName: userProfile.account_holder_name || '',
        bankName: userProfile.bank_name || '',
        accountType: userProfile.account_type || '',
        accountNumber: userProfile.account_number || '',
        routingNumber: userProfile.routing_number || '',
        addressLine1: userProfile.address_line1 || '',
        addressLine2: userProfile.address_line2 || '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        zipCode: userProfile.zip_code || '',
        ssnLastFour: userProfile.ssn_last_four || ''
      });
    }
  }, [userProfile, user, navigate, form]);

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save billing information",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("Saving billing information:", values);
      
      const { error } = await supabase.functions.invoke('update_billing_information', {
        body: {
          user_id: user.id,
          bank_name: values.bankName,
          account_number: values.accountNumber,
          routing_number: values.routingNumber,
          account_holder_name: values.accountHolderName,
          account_type: values.accountType,
          address_line1: values.addressLine1,
          address_line2: values.addressLine2,
          city: values.city,
          state: values.state,
          zip_code: values.zipCode,
          ssn_last_four: values.ssnLastFour
        }
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast({
        title: "Success",
        description: "Your billing information has been saved",
        variant: "default",
      });

      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error("Error saving billing information:", error);
      toast({
        title: "Error",
        description: "Failed to save billing information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-[#f8fafc]">
      <DashboardSidebar activeItem="billing" />
      
      <div className="flex-1 p-[20px_30px] space-y-8">
        <div className="flex justify-between items-center mb-[25px]">
          <div className="text-[26px] font-[600] text-[#1e293b]">
            <span className="text-[#4f46e5] relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[3px] after:bg-gradient-to-r after:from-[#4f46e5] after:to-[#00c2cb] after:rounded-[2px]">
              Billing
            </span> Information
          </div>
        </div>
        
        <div className="bg-white rounded-[20px] p-[30px] shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <div className="flex items-center mb-6">
            <CreditCard className="w-6 h-6 mr-3 text-[#4f46e5]" />
            <h2 className="text-xl font-semibold">Payment Details</h2>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="accountHolderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name on account" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a bank" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Grey">Grey</SelectItem>
                          <SelectItem value="Payoneer">Payoneer</SelectItem>
                          <SelectItem value="Wise">Wise</SelectItem>
                          <SelectItem value="Paypal">Paypal</SelectItem>
                          <SelectItem value="WorldPay">WorldPay</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Checking">Checking</SelectItem>
                          <SelectItem value="Savings">Savings</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Account number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="routingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Routing Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Routing number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ssnLastFour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last 4 Digits of SSN</FormLabel>
                      <FormControl>
                        <Input placeholder="Last 4 digits of SSN" maxLength={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="addressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1</FormLabel>
                        <FormControl>
                          <Input placeholder="Street address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="addressLine2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2 (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Apartment, suite, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="ZIP code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-6 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={`bg-gradient-to-r from-[#4f46e5] to-[#00c2cb] text-white shadow transition-all hover:shadow-lg ${isSuccess ? 'bg-green-500' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : isSuccess ? (
                    <span className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Saved
                    </span>
                  ) : (
                    'Save Payment Information'
                  )}
                </Button>
              </div>
            </form>
          </Form>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-500">
                Your information is securely stored and used only for payment purposes. We comply with all relevant data protection regulations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingInformation;
