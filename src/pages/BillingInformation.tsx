
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardSidebar } from '@/components/DashboardSidebar';

const BillingInformation = () => {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    routingNumber: '',
    accountHolderName: '',
    accountType: '',
    addressLine1: '',
    addressLine2: '', 
    city: '', 
    state: '', 
    zipCode: '',
    ssnLastFour: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        bankName: userProfile.bank_name || '',
        accountNumber: userProfile.account_number || '',
        confirmAccountNumber: userProfile.account_number || '',
        routingNumber: userProfile.routing_number || '',
        accountHolderName: userProfile.account_holder_name || '',
        accountType: userProfile.account_type || '',
        addressLine1: userProfile.address_line1 || '',
        addressLine2: userProfile.address_line2 || '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        zipCode: userProfile.zip_code || '',
        ssnLastFour: userProfile.ssn_last_four || ''
      });
    }
  }, [userProfile]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validate routing number (must be 9 digits)
    if (!/^\d{9}$/.test(formData.routingNumber.trim())) {
      newErrors.routingNumber = 'Please enter a valid 9-digit routing number';
    }
    
    // Validate account number (must not be empty and be at least 5 digits)
    if (!/^\d{5,}$/.test(formData.accountNumber.trim())) {
      newErrors.accountNumber = 'Please enter a valid account number (at least 5 digits)';
    }
    
    // Validate confirm account number (must match account number)
    if (formData.confirmAccountNumber.trim() !== formData.accountNumber.trim()) {
      newErrors.confirmAccountNumber = 'Account numbers do not match';
    }
    
    // Validate account type (must be selected)
    if (!formData.accountType) {
      newErrors.accountType = 'Please select an account type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Handle special formatting for numerical fields
    if (name === 'routingNumber' || name === 'accountNumber' || name === 'confirmAccountNumber' || name === 'ssnLastFour') {
      formattedValue = value.replace(/[^\d]/g, '');
    }

    // Limit SSN to 4 digits
    if (name === 'ssnLastFour' && formattedValue.length > 4) {
      formattedValue = formattedValue.slice(0, 4);
    }

    // Limit routing number to 9 digits
    if (name === 'routingNumber' && formattedValue.length > 9) {
      formattedValue = formattedValue.slice(0, 9);
    }

    setFormData({
      ...formData,
      [name]: formattedValue
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      toast({ 
        title: "Authentication Error", 
        description: "You must be logged in to update billing information.",
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);

    try {
      // Use the Supabase RPC function to update the profile
      const { error } = await supabase.rpc('update_user_profile_direct', {
        input_user_id: user.id,
        input_updates: {
          bank_name: formData.bankName,
          account_number: formData.accountNumber, 
          routing_number: formData.routingNumber,
          account_holder_name: formData.accountHolderName,
          account_type: formData.accountType,
          address_line1: formData.addressLine1,
          address_line2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          ssn_last_four: formData.ssnLastFour
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Your billing information has been saved.",
      });
    } catch (error) {
      console.error("Error updating billing information:", error);
      toast({
        title: "Error",
        description: "Failed to save billing information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!userProfile) return '';
    return `${userProfile.first_name?.[0] || ''}${userProfile.last_name?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <DashboardSidebar activePage="billing" />
      
      <div className="flex-1 p-8 ml-[240px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="text-2xl font-semibold">
            Billing <span className="relative text-indigo-600 after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[3px] after:bg-gradient-to-r after:from-indigo-600 after:to-[#00c2cb] after:rounded-md">Information</span>
          </div>
          
          <div className="flex items-center">
            <div className="flex gap-4 mr-5">
              <button className="w-[42px] h-[42px] rounded-xl bg-white flex items-center justify-center shadow-sm hover:translate-y-[-3px] transition-all hover:shadow-md text-gray-500 hover:text-indigo-600">
                <i className="fas fa-search"></i>
              </button>
              <button className="w-[42px] h-[42px] rounded-xl bg-white flex items-center justify-center shadow-sm hover:translate-y-[-3px] transition-all hover:shadow-md text-gray-500 hover:text-indigo-600 relative">
                <i className="fas fa-bell"></i>
                <span className="absolute top-[10px] right-[10px] w-[8px] h-[8px] bg-red-500 border-2 border-white rounded-full"></span>
              </button>
              <button className="w-[42px] h-[42px] rounded-xl bg-white flex items-center justify-center shadow-sm hover:translate-y-[-3px] transition-all hover:shadow-md text-gray-500 hover:text-indigo-600">
                <i className="fas fa-cog"></i>
              </button>
            </div>
            
            <div className="flex items-center bg-white px-[15px] py-[8px] rounded-[50px] shadow-sm hover:shadow-md transition-all hover:translate-y-[-3px] cursor-pointer">
              <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-r from-indigo-600 to-[#00c2cb] text-white flex items-center justify-center font-semibold text-[16px] mr-[10px]">
                {getInitials()}
              </div>
              <div className="font-medium text-gray-800">
                {userProfile?.first_name} {userProfile?.last_name}
              </div>
              <i className="fas fa-chevron-down text-gray-500 ml-2"></i>
            </div>
          </div>
        </div>
        
        {/* Billing Form Container */}
        <div className="bg-white rounded-2xl p-10 shadow-sm mb-10 relative overflow-hidden">
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Bank Account Information</h3>
            <p className="text-gray-500 text-sm">Please enter your bank account details below. This information is used to process your payments.</p>
          </div>
          
          <div className="flex items-center p-5 bg-indigo-50 rounded-xl mb-8">
            <div className="text-indigo-600 text-xl mr-4">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="text-gray-500 text-sm">
              <strong className="text-gray-800">Your information is secure.</strong> We use industry-standard encryption to protect your sensitive data. Your banking information is never stored on our servers.
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="max-w-[600px]">
            <div className="mb-6">
              <label htmlFor="routingNumber" className="block mb-2 font-medium text-gray-700 text-[15px]">
                Routing Number
              </label>
              <input
                type="text"
                id="routingNumber"
                name="routingNumber"
                value={formData.routingNumber}
                onChange={handleChange}
                placeholder="Enter your 9-digit routing number"
                maxLength={9}
                className={`w-full p-3 border ${errors.routingNumber ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all`}
              />
              <div className="text-xs text-gray-500 mt-1">The 9-digit number on the bottom left of your check</div>
              {errors.routingNumber && <div className="text-xs text-red-500 mt-1">{errors.routingNumber}</div>}
            </div>
            
            <div className="mb-6">
              <label htmlFor="accountNumber" className="block mb-2 font-medium text-gray-700 text-[15px]">
                Account Number
              </label>
              <input
                type="password"
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Enter your account number"
                className={`w-full p-3 border ${errors.accountNumber ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all`}
              />
              <div className="text-xs text-gray-500 mt-1">Your account number is typically 10-12 digits</div>
              {errors.accountNumber && <div className="text-xs text-red-500 mt-1">{errors.accountNumber}</div>}
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmAccountNumber" className="block mb-2 font-medium text-gray-700 text-[15px]">
                Confirm Account Number
              </label>
              <input
                type="password"
                id="confirmAccountNumber"
                name="confirmAccountNumber"
                value={formData.confirmAccountNumber}
                onChange={handleChange}
                placeholder="Re-enter your account number"
                className={`w-full p-3 border ${errors.confirmAccountNumber ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all`}
              />
              {errors.confirmAccountNumber && <div className="text-xs text-red-500 mt-1">{errors.confirmAccountNumber}</div>}
            </div>
            
            <div className="mb-6">
              <label htmlFor="accountType" className="block mb-2 font-medium text-gray-700 text-[15px]">
                Account Type
              </label>
              <select
                id="accountType"
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className={`w-full p-3 border ${errors.accountType ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all`}
              >
                <option value="">Select account type</option>
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
              {errors.accountType && <div className="text-xs text-red-500 mt-1">{errors.accountType}</div>}
            </div>
            
            <div className="flex gap-4 mt-10">
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-[#00c2cb] text-white font-medium rounded-xl shadow-md hover:translate-y-[-3px] hover:shadow-lg transition-all flex items-center justify-center"
              >
                <i className="fas fa-save mr-2"></i> 
                {loading ? 'Saving...' : 'Save Banking Information'}
              </button>
              <button 
                type="button" 
                className="px-6 py-3 bg-gray-100 text-gray-500 font-medium rounded-xl hover:bg-gray-200 hover:text-gray-700 transition-all flex items-center justify-center"
              >
                <i className="fas fa-times mr-2"></i> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BillingInformation;
