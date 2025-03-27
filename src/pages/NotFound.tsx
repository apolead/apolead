
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md text-center px-6">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-indigo-600 mb-2">404</h1>
          <div className="relative w-32 h-1 bg-[#00c2cb] mx-auto my-6 rounded-full"></div>
        </div>
        
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Page Not Found</h2>
        
        <p className="text-lg text-gray-600 mb-8">
          Oops! You've stumbled upon a page that doesn't exist. It might have been moved or deleted.
        </p>
        
        <div className="flex justify-center space-x-4">
          <Button 
            asChild
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center"
          >
            <Link to="/">
              <ArrowLeft className="mr-2 h-5 w-5" /> 
              Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="mt-12">
          <div className="text-center">
            <h3 className="text-xl font-bold inline">
              <span className="text-[#00c2cb]">Apo</span><span className="text-indigo-600">Lead</span>
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
