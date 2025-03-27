
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <div className="relative inline-block">
            <div className="text-8xl font-bold text-[#00c2cb]/20">404</div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600 text-2xl font-semibold">
              Oops!
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          You've wandered into uncharted territory. The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Button 
          onClick={handleGoHome}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2"
        >
          <Home className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
