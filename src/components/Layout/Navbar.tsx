
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedButton from '../UI/AnimatedButton';
import { LogIn, LogOut, UserPlus, Home, User, Tractor } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Success",
        description: "You have been signed out",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-50 border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
            <Home className="w-5 h-5" />
            Agree2Table
          </Link>

          <div className="flex items-center gap-4">
            {user && profile ? (
              <>
                <Link 
                  to={profile.user_type === 'farmer' ? '/farmer-dashboard' : '/user-dashboard'}
                  className="text-sm font-medium flex items-center gap-2 hover:text-primary transition-colors"
                >
                  {profile.user_type === 'farmer' ? 
                    <Tractor className="w-4 h-4" /> : 
                    <User className="w-4 h-4" />
                  }
                  Dashboard
                </Link>
                <AnimatedButton
                  variant="outline"
                  onClick={handleSignOut}
                  icon={<LogOut className="w-4 h-4" />}
                  iconPosition="left"
                  size="sm"
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
                    size="sm"
                  >
                    Sign In
                  </AnimatedButton>
                </Link>
                <Link to="/register">
                  <AnimatedButton
                    icon={<UserPlus className="w-4 h-4" />}
                    iconPosition="left"
                    size="sm"
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
