
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, LogIn, LogOut, UserPlus, Home, User, Settings, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const MovieNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-50 border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
            <Film className="w-5 h-5" />
            MovieHub
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-foreground hover:text-primary transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/movie-view"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Browse
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/user-dashboard"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  <Settings className="w-4 h-4 inline mr-1" />
                  Settings
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="container mx-auto px-6 py-4 space-y-4">
            <Link
              to="/movie-view"
              className="block text-foreground hover:text-primary transition-colors"
              onClick={toggleMenu}
            >
              Browse
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/user-dashboard"
                  className="block text-foreground hover:text-primary transition-colors"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  className="block text-foreground hover:text-primary transition-colors"
                  onClick={toggleMenu}
                >
                  <Settings className="w-4 h-4 inline mr-1" />
                  Settings
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    handleSignOut();
                    toggleMenu();
                  }}
                  className="w-full justify-start"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={toggleMenu}>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={toggleMenu}>
                  <Button size="sm" className="w-full justify-start">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default MovieNavbar;
