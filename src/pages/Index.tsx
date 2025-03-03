
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Log the navigation attempt
    console.log("Index page: Attempting to redirect to dashboard");
    
    // Directly navigate to dashboard with a slight delay to ensure hooks are initialized
    const redirectTimer = setTimeout(() => {
      navigate("/dashboard");
      console.log("Index page: Redirect executed");
    }, 100);
    
    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Loading...</h1>
        <p className="text-xl text-gray-600">Redirecting to dashboard</p>
      </div>
    </div>
  );
};

export default Index;
