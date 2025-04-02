
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const StepTwo = ({ userData, updateUserData, nextStep, prevStep }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploadingSpeedTest, setIsUploadingSpeedTest] = useState(false);
  const [isUploadingSystemSettings, setIsUploadingSystemSettings] = useState(false);
  const { toast } = useToast();
  
  const handleContinue = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Basic validation
    if (!userData.cpuType) {
      setErrorMessage('Please select your CPU type');
      return;
    }
    
    if (!userData.ramAmount) {
      setErrorMessage('Please select your RAM amount');
      return;
    }
    
    if (!userData.speedTest && !userData.speedTestUrl) {
      setErrorMessage('Please upload your internet speed test screenshot');
      return;
    }
    
    if (!userData.systemSettings && !userData.systemSettingsUrl) {
      setErrorMessage('Please upload your system settings screenshot');
      return;
    }
    
    // Proceed to next step
    nextStep();
  };
  
  const handleFileUpload = async (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      if (fileType === 'speedTest') {
        setIsUploadingSpeedTest(true);
        updateUserData({ speedTest: file });
      } else if (fileType === 'systemSettings') {
        setIsUploadingSystemSettings(true);
        updateUserData({ systemSettings: file });
      }
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Determine the correct bucket
      const bucketName = fileType === 'speedTest' ? 'speed_tests' : 'system_settings';
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);
      
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      console.log(`${fileType} file uploaded successfully:`, urlData.publicUrl);
      
      // Update user data with the file URL
      if (fileType === 'speedTest') {
        updateUserData({ speedTestUrl: urlData.publicUrl });
      } else if (fileType === 'systemSettings') {
        updateUserData({ systemSettingsUrl: urlData.publicUrl });
      }
      
      toast({
        title: "File Uploaded",
        description: `${fileType === 'speedTest' ? 'Speed test' : 'System settings'} uploaded successfully.`,
      });
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      toast({
        title: "Upload Failed",
        description: error.message || `Failed to upload ${fileType === 'speedTest' ? 'speed test' : 'system settings'}`,
        variant: "destructive"
      });
    } finally {
      if (fileType === 'speedTest') {
        setIsUploadingSpeedTest(false);
      } else if (fileType === 'systemSettings') {
        setIsUploadingSystemSettings(false);
      }
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Left Side - Visual */}
      <div className="w-full md:w-1/2 bg-[#1A1F2C] text-white relative p-8 md:p-16 flex flex-col justify-between overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00c2cb] opacity-10 rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600 opacity-10 rounded-full translate-y-1/3 -translate-x-1/3"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-[#00c2cb] opacity-5 rotate-45"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-6">Step 2 of 4: System Requirements</h2>
          <p className="text-white/80 mb-6">We need to verify that your computer meets our minimum requirements.</p>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm mb-6">
            <h4 className="font-semibold mb-2">Why we need this information</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>To ensure you can run our agent software efficiently</li>
              <li>To verify you have adequate internet connectivity</li>
              <li>To confirm you have the necessary equipment for customer interactions</li>
            </ul>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <h4 className="font-semibold mb-2">Minimum Requirements</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>CPU: Intel i3 / AMD Ryzen 3 or better</li>
              <li>RAM: 8GB or more</li>
              <li>Internet: 10 Mbps download / 5 Mbps upload</li>
              <li>Headset with microphone</li>
              <li>Quiet work environment</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-auto pt-4 text-sm opacity-75">
          <p>You can contact technical support if you have questions about meeting these requirements.</p>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 flex flex-col">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold inline">
            <span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span>
          </h2>
        </div>
        
        <div className="w-full bg-indigo-100 h-2 rounded-full mb-8">
          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "66.6%" }}></div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">System Information</h2>
        <p className="text-gray-600 mb-6">Please provide information about your computer system and work environment.</p>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-6">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleContinue} className="space-y-6">
          {/* CPU Type */}
          <div>
            <label htmlFor="cpuType" className="block text-sm font-medium text-gray-700 mb-1">
              CPU Type
            </label>
            <Select 
              value={userData.cpuType} 
              onValueChange={(value) => updateUserData({ cpuType: value })}
            >
              <SelectTrigger id="cpuType">
                <SelectValue placeholder="Select CPU Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intel_i3">Intel i3</SelectItem>
                <SelectItem value="intel_i5">Intel i5</SelectItem>
                <SelectItem value="intel_i7">Intel i7</SelectItem>
                <SelectItem value="intel_i9">Intel i9</SelectItem>
                <SelectItem value="amd_ryzen3">AMD Ryzen 3</SelectItem>
                <SelectItem value="amd_ryzen5">AMD Ryzen 5</SelectItem>
                <SelectItem value="amd_ryzen7">AMD Ryzen 7</SelectItem>
                <SelectItem value="amd_ryzen9">AMD Ryzen 9</SelectItem>
                <SelectItem value="apple_m1">Apple M1</SelectItem>
                <SelectItem value="apple_m2">Apple M2</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* RAM Amount */}
          <div>
            <label htmlFor="ramAmount" className="block text-sm font-medium text-gray-700 mb-1">
              RAM Amount
            </label>
            <Select 
              value={userData.ramAmount} 
              onValueChange={(value) => updateUserData({ ramAmount: value })}
            >
              <SelectTrigger id="ramAmount">
                <SelectValue placeholder="Select RAM Amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4gb">4 GB</SelectItem>
                <SelectItem value="8gb">8 GB</SelectItem>
                <SelectItem value="16gb">16 GB</SelectItem>
                <SelectItem value="32gb">32 GB</SelectItem>
                <SelectItem value="64gb+">64 GB+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Internet Speed Test */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Internet Speed Test Screenshot
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Please take a screenshot of your speed test results from <a href="https://www.speedtest.net" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">speedtest.net</a> and upload it here.
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center bg-gray-50">
              <input
                type="file"
                id="speedTest"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'speedTest')}
                disabled={isUploadingSpeedTest}
              />
              <label htmlFor="speedTest" className="cursor-pointer">
                {isUploadingSpeedTest ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-2" />
                    <p className="text-sm text-gray-500">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <svg className="w-10 h-10 text-gray-400 mb-2 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    <p className="text-sm text-gray-500 mb-1">
                      {userData.speedTestUrl ? 
                        `File uploaded successfully` : 
                        'Drag and drop your speed test screenshot here, or click to browse'
                      }
                    </p>
                    <p className="text-xs text-gray-500">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
                  </>
                )}
              </label>
            </div>
          </div>
          
          {/* System Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Settings Screenshot
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Please take a screenshot of your system information page and upload it here.
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center bg-gray-50">
              <input
                type="file"
                id="systemSettings"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'systemSettings')}
                disabled={isUploadingSystemSettings}
              />
              <label htmlFor="systemSettings" className="cursor-pointer">
                {isUploadingSystemSettings ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-2" />
                    <p className="text-sm text-gray-500">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <svg className="w-10 h-10 text-gray-400 mb-2 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    <p className="text-sm text-gray-500 mb-1">
                      {userData.systemSettingsUrl ? 
                        `File uploaded successfully` : 
                        'Drag and drop your system information screenshot here, or click to browse'
                      }
                    </p>
                    <p className="text-xs text-gray-500">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
                  </>
                )}
              </label>
            </div>
          </div>
          
          {/* Equipment Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Do you have a headset with microphone?
                </label>
                <p className="text-xs text-gray-500">Required for customer interactions</p>
              </div>
              <Switch 
                checked={userData.hasHeadset} 
                onCheckedChange={(checked) => updateUserData({ hasHeadset: checked })} 
                id="hasHeadset"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Do you have a quiet place to work?
                </label>
                <p className="text-xs text-gray-500">Minimal background noise required</p>
              </div>
              <Switch 
                checked={userData.hasQuietPlace} 
                onCheckedChange={(checked) => updateUserData({ hasQuietPlace: checked })} 
                id="hasQuietPlace"
              />
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
            >
              Back
            </Button>
            
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isUploadingSpeedTest || isUploadingSystemSettings}
            >
              {isUploadingSpeedTest || isUploadingSystemSettings ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : 'Next'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StepTwo;
