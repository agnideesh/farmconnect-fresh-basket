
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedButton from '../UI/AnimatedButton';
import { LogIn, LogOut, UserPlus } from 'lucide-react';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-50 border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-primary">
            Agree2Table
          </Link>

          <div className="flex items-center gap-4">
            {user && profile ? (
              <>
                <Link 
                  to={profile.user_type === 'farmer' ? '/farmer-dashboard' : '/user-dashboard'}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <AnimatedButton
                  variant="outline"
                  onClick={signOut}
                  icon={<LogOut className="w-4 h-4" />}
                  iconPosition="left"
                >
                  Sign Out
                </AnimatedButton>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <AnimatedButton
                    variant="outline"
                    icon={<LogIn className="w-4 h-4" />}
                    iconPosition="left"
                  >
                    Sign In
                  </AnimatedButton>
                </Link>
                <Link to="/register">
                  <AnimatedButton
                    icon={<UserPlus className="w-4 h-4" />}
                    iconPosition="left"
                  >
                    Sign Up
                  </AnimatedButton>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
