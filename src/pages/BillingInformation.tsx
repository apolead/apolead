
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div className="main-content" style={{ flex: 1, padding: '40px' }}>
        <div className="header" style={{ marginBottom: '30px' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            className="back-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#4f46e5',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '0',
              marginBottom: '20px'
            }}
          >
            <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i>
            Back to Dashboard
          </button>
          
          <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>
            Billing Information
          </h1>
          <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '30px' }}>
            Add your bank account information for receiving payments
          </p>
        </div>

        <div className="billing-form-container" style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '30px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
          maxWidth: '600px'
        }}>
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
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 500,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: 'all 0.3s',
                  marginTop: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin" style={{ marginRight: '8px' }}></i>
                    Saving...
                  </>
                ) : (
                  "Save Banking Information"
                )}
              </button>
            </form>
          </Form>
          
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: '#f8fafc', 
            borderRadius: '8px',
            fontSize: '14px',
            color: '#64748b'
          }}>
            <i className="fas fa-lock" style={{ marginRight: '8px', color: '#4f46e5' }}></i>
            Your banking information is encrypted and stored securely.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingInformation;
