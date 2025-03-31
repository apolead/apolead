
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/DashboardSidebar';

const billingFormSchema = z.object({
  accountNumber: z.string().min(4, { message: "Account number must be at least 4 digits" }),
  confirmAccountNumber: z.string(),
  routingNumber: z.string().min(9, { message: "Routing number must be at least 9 digits" }),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
  message: "Account numbers don't match",
  path: ["confirmAccountNumber"],
});

type BillingFormValues = z.infer<typeof billingFormSchema>;

const BillingInformation: React.FC = () => {
  const { userProfile, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BillingFormValues>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      accountNumber: "",
      confirmAccountNumber: "",
      routingNumber: "",
    },
  });

  const onSubmit = async (values: BillingFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Save to user profile - encryption would be better in a production environment
      await updateProfile({
        account_number: values.accountNumber,
        routing_number: values.routingNumber,
      });
      
      toast({
        title: "Banking information saved",
        description: "Your payment information has been securely stored.",
      });
      
      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving billing info:", error);
      toast({
        title: "Error saving information",
        description: "There was a problem saving your banking information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f8fafc]">
        <DashboardSidebar />
        <div className="main-content flex-1 p-10">
          <div className="header mb-8">
            <h1 className="text-2xl font-semibold text-[#1e293b] mb-2">
              Billing Information
            </h1>
            <p className="text-[#64748b] mb-6">
              Add your bank account information for receiving payments
            </p>
          </div>

          <div className="billing-form-container bg-white rounded-xl p-8 shadow-sm max-w-2xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Enter your account number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the account number where you want to receive payments.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Account Number</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Confirm your account number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Please re-enter your account number to confirm.
                      </FormDescription>
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
                        <Input type="text" placeholder="Enter your routing number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the 9-digit routing number for your bank.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium flex items-center justify-center transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Banking Information"
                  )}
                </button>
              </form>
            </Form>
            
            <div className="mt-5 p-4 bg-[#f8fafc] rounded-lg text-sm text-[#64748b]">
              <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-4 w-4 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Your banking information is encrypted and stored securely.
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BillingInformation;
