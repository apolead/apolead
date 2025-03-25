
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const StepZero = ({ userData, updateUserData, nextStep }) => {
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleContinue = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!userData.firstName || !userData.email) {
      setErrorMessage('Please fill in all required fields');
      return;
    }
    
    // Add password field
    if (!userData.password || userData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }
    
    // Continue to next step
    nextStep();
  };
  
  const handleGoogleSignUp = () => {
    // This would be implemented with Supabase Auth
    console.log('Sign up with Google');
  };
  
  return (
    <div className="flex flex-col md:flex-row w-full max-w-6xl shadow-xl rounded-lg overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 p-8 md:p-16 bg-white flex flex-col relative">
        {/* Back to Home Link */}
        <div className="absolute top-4 left-4">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
      
        <div className="mb-8">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <h2 className="text-3xl font-bold inline">
              <span className="text-black">Apo</span><span className="text-indigo-600">Lead</span>
            </h2>
          </div>

          <h1 className="text-3xl font-bold mb-2 text-center">Join Our Call Center Team</h1>
          <p className="text-gray-600 mb-8 text-center">Create your profile and start earning commissions on sales</p>
          
          {/* Google Login Only */}
          <div className="flex justify-center mb-8">
            <button 
              className="flex items-center justify-center border border-gray-300 rounded-md py-3 px-4 hover:bg-gray-50 transition w-full"
              onClick={handleGoogleSignUp}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">We only support Gmail accounts at this time</p>
          </div>
          
          <p className="text-center text-gray-600 mt-6">
            Already part of our team? <Link to="/login" className="text-indigo-600 hover:underline">Sign in</Link>
          </p>
        </div>
        
        <div className="mt-auto">
          <p className="text-center text-gray-500 text-sm">© 2025 Apolead, All rights Reserved</p>
        </div>
      </div>
      
      {/* Right Side - Visual */}
      <div className="hidden md:block w-1/2 bg-gradient-to-br from-indigo-600 to-purple-500 p-16 text-white relative">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Start Your Call Center Career Today</h2>
          <p className="opacity-80 text-white">Earn competitive commissions on sales</p>
        </div>
        
        {/* Dashboard Mockup */}
        <div className="bg-white rounded-lg shadow-xl p-4 text-black">
          <div className="mb-4">
            <h3 className="font-bold text-gray-700">Dashboard</h3>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">Dec 17, 2024 - Jan 10, 2025</div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xs text-indigo-600">+3</span>
                </div>
                <button className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded">Add member</button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-gray-500">Average Sales / Day</div>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-xl font-bold">$1,450</div>
                <div className="h-12 w-20 relative">
                  {/* Simple chart representation */}
                  <div className="absolute bottom-0 left-0 w-full flex items-end">
                    <div className="bg-indigo-200 w-3 h-5 mx-0.5 rounded-t"></div>
                    <div className="bg-indigo-300 w-3 h-7 mx-0.5 rounded-t"></div>
                    <div className="bg-indigo-400 w-3 h-9 mx-0.5 rounded-t"></div>
                    <div className="bg-indigo-500 w-3 h-6 mx-0.5 rounded-t"></div>
                    <div className="bg-indigo-600 w-3 h-10 mx-0.5 rounded-t"></div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-green-600 mt-1">+24% commission rate</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-gray-500">Monthly Commission</div>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-xl font-bold">$3,250</div>
                <div className="h-12 w-20 relative">
                  {/* Simple chart representation */}
                  <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
                    <svg viewBox="0 0 80 48" className="w-full h-full">
                      <path d="M0,40 C20,35 40,15 80,20" stroke="#818CF8" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="text-xs text-green-600 mt-1">+15% from last month</div>
            </div>
          </div>
          
          {/* Team Table */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-3">Top Agent Performance</h4>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500">
                  <th className="text-left pb-2">Agent Name</th>
                  <th className="text-center pb-2">Conversion Rate</th>
                  <th className="text-center pb-2">Credit Sales</th>
                  <th className="text-right pb-2">Monthly Earnings</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-200">
                  <td className="py-2 flex items-center">
                    <span className="w-4 h-4 rounded-full bg-indigo-500 inline-block mr-2"></span>
                    Sarah J.
                  </td>
                  <td className="text-center py-2 font-medium">32.5%</td>
                  <td className="text-center py-2 font-medium">$28,520</td>
                  <td className="text-right py-2">$4,850</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="py-2 flex items-center">
                    <span className="w-4 h-4 rounded-full bg-orange-500 inline-block mr-2"></span>
                    Michael T.
                  </td>
                  <td className="text-center py-2 font-medium">29.8%</td>
                  <td className="text-center py-2 font-medium">$25,430</td>
                  <td className="text-right py-2">$4,320</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Client Logos */}
        <div className="absolute bottom-16 left-16 right-16">
          <div className="flex justify-between items-center opacity-70">
            <div className="text-xl font-bold">Trusted by</div>
            <div className="flex space-x-8">
              <svg className="h-8 w-auto" viewBox="0 0 120 28" fill="currentColor">
                <path d="M34.87 8.07H37.87V20.2H34.87V8.07ZM39.06 15.62C39.06 12.62 40.9 10.83 43.74 10.83C46.58 10.83 48.42 12.62 48.42 15.62C48.42 18.62 46.62 20.42 43.74 20.42C40.86 20.42 39.06 18.67 39.06 15.62ZM45.41 15.62C45.41 13.97 44.76 13 43.74 13C42.72 13 42.08 14 42.08 15.62C42.08 17.24 42.71 18.22 43.74 18.22C44.77 18.22 45.41 17.3 45.41 15.63V15.62ZM49.55 20.79H52.43C52.5671 21.0945 52.7988 21.3466 53.0907 21.5088C53.3826 21.6709 53.7191 21.7345 54.05 21.69C55.19 21.69 55.79 21.07 55.79 20.17V18.49H55.73C55.491 19.0049 55.1031 19.4363 54.6165 19.7287C54.1299 20.021 53.5668 20.1608 53 20.13C50.81 20.13 49.36 18.46 49.36 15.59C49.36 12.72 50.74 10.91 53.04 10.91C53.6246 10.8871 54.2022 11.0434 54.6955 11.3579C55.1888 11.6725 55.5742 12.1303 55.8 12.67V12.67V11H58.8V20.1C58.8 22.29 56.87 23.65 54.02 23.65C51.37 23.65 49.72 22.46 49.55 20.8V20.79ZM55.8 15.61C55.8 14.15 55.13 13.23 54.07 13.23C53.01 13.23 52.36 14.14 52.36 15.61C52.36 17.08 53 17.91 54.07 17.91C55.14 17.91 55.8 17.1 55.8 15.62V15.61ZM59.93 15.61C59.93 12.61 61.77 10.82 64.61 10.82C67.45 10.82 69.3 12.61 69.3 15.61C69.3 18.61 67.5 20.41 64.61 20.41C61.72 20.41 59.93 18.67 59.93 15.62V15.61ZM66.28 15.61C66.28 13.96 65.63 12.99 64.61 12.99C63.59 12.99 63 14 63 15.63C63 17.26 63.63 18.23 64.65 18.23C65.67 18.23 66.28 17.3 66.28 15.63V15.61ZM70.44 8.82C70.4321 8.51711 70.5144 8.2187 70.6763 7.96909C70.8383 7.71947 71.0726 7.52741 71.3496 7.41669C71.6266 7.30597 71.9322 7.28344 72.2223 7.35173C72.5124 7.42002 72.7763 7.57482 72.9787 7.79634C73.1811 8.01786 73.312 8.29245 73.3536 8.58689C73.3952 8.88132 73.346 9.18091 73.2131 9.44536C73.0802 9.7098 72.8698 9.92375 72.6083 10.0629C72.3468 10.2021 72.0463 10.2608 71.75 10.23C71.5533 10.2035 71.3639 10.1292 71.1979 10.0126C71.0319 9.89599 70.8928 9.74084 70.7908 9.55905C70.6888 9.37727 70.6262 9.17355 70.6073 8.96326C70.5883 8.75297 70.6136 8.54087 70.6811 8.34M70.44 11.02H73.44V20.2H70.44V11.02ZM84.33 15.61C84.33 18.61 83 20.32 80.72 20.32C80.1354 20.3575 79.5533 20.2146 79.0525 19.9122C78.5517 19.6097 78.1564 19.1622 77.92 18.63H77.86V23.14H74.86V11H77.86V12.64H77.92C78.1454 12.0951 78.5332 11.6329 79.0306 11.3162C79.528 10.9995 80.1109 10.8437 80.7 10.87C83 10.91 84.37 12.63 84.37 15.63L84.33 15.61ZM81.33 15.61C81.33 14.15 80.66 13.22 79.61 13.22C78.56 13.22 77.89 14.16 77.88 15.61C77.87 17.06 78.56 17.99 79.61 17.99C80.66 17.99 81.33 17.08 81.33 15.63V15.61ZM89.48 10.81C91.97 10.81 93.48 11.99 93.55 13.88H90.82C90.82 13.23 90.28 12.82 89.45 12.82C88.62 12.82 88.25 13.14 88.25 13.61C88.25 14.08 88.58 14.23 89.25 14.37L91.17 14.76C93 15.15 93.78 15.89 93.78 17.28C93.78 19.18 92.05 20.4 89.5 20.4C86.95 20.4 85.28 19.18 85.15 17.31H88.04C88.13 17.99 88.67 18.39 89.55 18.39C90.43 18.39 90.83 18.1 90.83 17.62C90.83 17.14 90.55 17.04 89.83 16.89L88.1 16.52C86.31 16.15 85.37 15.2 85.37 13.8C85.39 12 87 10.83 89.48 10.83V10.81ZM103.79 20.18H100.9V18.47H100.84C100.681 19.0441 100.331 19.5466 99.8468 19.8941C99.3629 20.2415 98.7748 20.413 98.18 20.38C97.7242 20.4059 97.2682 20.3337 96.8427 20.1682C96.4172 20.0027 96.0322 19.7479 95.7137 19.4208C95.3952 19.0938 95.1505 18.7021 94.9964 18.2724C94.8422 17.8427 94.7821 17.3849 94.82 16.93V11H97.82V16.24C97.82 17.33 98.38 17.91 99.31 17.91C99.5281 17.9104 99.7437 17.8643 99.9425 17.7746C100.141 17.6849 100.319 17.5537 100.463 17.3899C100.606 17.226 100.714 17.0333 100.777 16.8247C100.84 16.616 100.859 16.3962 100.83 16.18V11H103.83L103.79 20.18ZM105.24 11H108.14V12.77H108.2C108.359 12.2035 108.702 11.7057 109.174 11.3547C109.646 11.0037 110.222 10.8191 110.81 10.83C111.409 10.7821 112.003 10.9612 112.476 11.3318C112.948 11.7024 113.264 12.2372 113.36 12.83H113.42C113.601 12.2309 113.977 11.7093 114.488 11.3472C114.998 10.9851 115.615 10.8031 116.24 10.83C116.648 10.8163 117.054 10.8886 117.432 11.0422C117.811 11.1957 118.152 11.4272 118.435 11.7214C118.718 12.0157 118.936 12.3662 119.075 12.7501C119.213 13.134 119.27 13.5429 119.24 13.95V20.2H116.24V14.75C116.24 13.75 115.79 13.29 114.95 13.29C114.763 13.2884 114.577 13.327 114.406 13.4032C114.235 13.4794 114.082 13.5914 113.958 13.7317C113.834 13.872 113.741 14.0372 113.686 14.2163C113.631 14.3955 113.616 14.5843 113.64 14.77V20.2H110.79V14.71C110.79 13.79 110.34 13.29 109.52 13.29C109.331 13.2901 109.143 13.3303 108.971 13.408C108.798 13.4858 108.643 13.5993 108.518 13.741C108.392 13.8827 108.298 14.0495 108.241 14.2304C108.185 14.4112 108.167 14.6019 108.19 14.79V20.2H105.19L105.24 11Z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepZero;
