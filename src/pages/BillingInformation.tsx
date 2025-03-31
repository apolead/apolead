
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define form schema
const billingFormSchema = z.object({
  bank_name: z.string().min(2, { message: "Bank name is required" }),
  account_number: z.string().min(4, { message: "Account number is required" }),
  routing_number: z.string().min(8, { message: "Routing number is required" }),
  account_holder_name: z.string().min(2, { message: "Account holder name is required" }),
  account_type: z.string().min(1, { message: "Account type is required" }),
  address_line1: z.string().min(1, { message: "Address line 1 is required" }),
  address_line2: z.string().optional(),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  zip_code: z.string().min(5, { message: "ZIP code is required" }),
  ssn_last_four: z.string().length(4, { message: "Last 4 digits of SSN required" }),
});

type BillingFormValues = z.infer<typeof billingFormSchema>;

export default function BillingInformation() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Set default values from user profile if available
  const defaultValues: Partial<BillingFormValues> = {
    bank_name: userProfile?.bank_name || "",
    account_number: userProfile?.account_number || "",
    routing_number: userProfile?.routing_number || "",
    account_holder_name: userProfile?.account_holder_name || "",
    account_type: userProfile?.account_type || "",
    address_line1: userProfile?.address_line1 || "",
    address_line2: userProfile?.address_line2 || "",
    city: userProfile?.city || "",
    state: userProfile?.state || "",
    zip_code: userProfile?.zip_code || "",
    ssn_last_four: userProfile?.ssn_last_four || "",
  };

  const form = useForm<BillingFormValues>({
    resolver: zodResolver(billingFormSchema),
    defaultValues,
  });

  async function onSubmit(data: BillingFormValues) {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update billing information",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Instead of calling the stored procedure directly, update the user profile
      // using the update_user_profile_direct function that already exists
      const { error } = await supabase.rpc('update_user_profile_direct', {
        input_user_id: user.id,
        input_updates: {
          bank_name: data.bank_name,
          account_number: data.account_number,
          routing_number: data.routing_number,
          account_holder_name: data.account_holder_name,
          account_type: data.account_type,
          address_line1: data.address_line1,
          address_line2: data.address_line2 || "",
          city: data.city,
          state: data.state,
          zip_code: data.zip_code,
          ssn_last_four: data.ssn_last_four
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your billing information has been updated",
      });
    } catch (error: any) {
      console.error("Error updating billing information:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update billing information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Billing Information</CardTitle>
          <CardDescription>
            Enter your banking details to receive payments. Your information is securely stored.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bank Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Bank Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter bank name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter account number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="routing_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Routing Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter routing number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="account_holder_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Holder Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter account holder name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="account_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="checking">Checking</SelectItem>
                            <SelectItem value="savings">Savings</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ssn_last_four"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last 4 Digits of SSN</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Last 4 digits of SSN" 
                            maxLength={4} 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          For tax reporting purposes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Billing Address</h3>
                  
                  <FormField
                    control={form.control}
                    name="address_line1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter street address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address_line2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2 (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Apt, Suite, Unit, etc." {...field} />
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
                          <Input placeholder="Enter city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="zip_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter ZIP code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Billing Information"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
