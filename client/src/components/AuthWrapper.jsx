"use client";

import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const AuthWrapper = ({ children }) => {
  const { loading, authChecked } = useAuth();

  // Show loading spinner while authentication is being checked
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="xl" className="mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthWrapper;
