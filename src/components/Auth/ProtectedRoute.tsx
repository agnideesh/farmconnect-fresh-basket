
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType?: 'user' | 'farmer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, userType }) => {
  const { user, isLoading, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    } else if (!isLoading && user && userType && profile?.user_type !== userType) {
      // Redirect to appropriate dashboard based on user type
      navigate(profile?.user_type === 'farmer' ? '/farmer-dashboard' : '/user-dashboard');
    }
  }, [isLoading, user, navigate, userType, profile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (userType && profile?.user_type !== userType) {
    return <Navigate to={profile?.user_type === 'farmer' ? '/farmer-dashboard' : '/user-dashboard'} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
