
import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, User, Search, LogOut } from 'lucide-react';
import AnimatedButton from '../UI/AnimatedButton';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleDashboard = () => {
    if (profile?.user_type === 'farmer') {
      navigate('/farmer-dashboard');
    } else {
      navigate('/user-dashboard');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Farmers', path: '/farmers' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex items-center h-16 md:h-20 px-6 md:px-8',
        scrolled 
          ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm' 
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 md:w-10 md:h-10">
            <div className="absolute inset-0 bg-primary rounded-full opacity-20 animate-pulse-subtle"></div>
            <div className="absolute inset-0 flex items-center justify-center text-primary font-semibold text-lg md:text-xl">A2T</div>
          </div>
          <span className="text-xl md:text-2xl font-semibold">Agree2Table</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-foreground/80 hover:text-foreground transition-colors duration-200 font-medium"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Action Icons */}
        <div className="hidden md:flex items-center gap-4">
          <button className="p-2 hover:bg-secondary rounded-full transition-colors duration-200">
            <Search className="w-5 h-5" />
          </button>
          
          {user ? (
            <div className="relative group">
              <button 
                className="p-2 hover:bg-secondary rounded-full transition-colors duration-200"
                onClick={handleDashboard}
              >
                <User className="w-5 h-5" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black rounded-md shadow-lg overflow-hidden z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-3 border-b border-border">
                  <p className="font-medium truncate">{profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile?.user_type}</p>
                </div>
                <div className="p-2">
                  <button 
                    onClick={handleDashboard}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-secondary rounded-md transition-colors"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-secondary rounded-md transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              className="p-2 hover:bg-secondary rounded-full transition-colors duration-200"
              onClick={handleDashboard}
            >
              <User className="w-5 h-5" />
            </button>
          )}
          
          <button className="p-2 hover:bg-secondary rounded-full transition-colors duration-200 relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              0
            </span>
          </button>
          
          {user ? (
            <AnimatedButton size="sm" onClick={handleSignOut}>Sign Out</AnimatedButton>
          ) : (
            <AnimatedButton size="sm" onClick={handleSignIn}>Sign In</AnimatedButton>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4 md:hidden">
          <button className="p-2 hover:bg-secondary rounded-full transition-colors duration-200 relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              0
            </span>
          </button>
          <button
            className="p-2 hover:bg-secondary rounded-full transition-colors duration-200"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={cn(
          'fixed inset-0 top-16 bg-white dark:bg-black z-40 transform transition-transform duration-300 ease-in-out',
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="container h-full mx-auto py-8 px-6 flex flex-col">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-lg font-medium py-3 border-b border-border"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          <div className="mt-8 space-y-4">
            {user ? (
              <>
                <div className="p-4 bg-secondary/50 rounded-lg mb-4">
                  <p className="font-medium">{profile?.full_name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{profile?.user_type}</p>
                </div>
                <AnimatedButton
                  fullWidth
                  size="lg"
                  onClick={handleDashboard}
                >
                  Dashboard
                </AnimatedButton>
                <AnimatedButton
                  variant="outline"
                  fullWidth
                  size="lg"
                  onClick={handleSignOut}
                >
                  Sign Out
                </AnimatedButton>
              </>
            ) : (
              <AnimatedButton
                fullWidth
                size="lg"
                onClick={() => {
                  navigate('/auth');
                  setIsMenuOpen(false);
                }}
              >
                Sign In
              </AnimatedButton>
            )}
            
            <div className="flex justify-center gap-4 py-4">
              <button className="p-3 hover:bg-secondary rounded-full transition-colors duration-200">
                <Search className="w-6 h-6" />
              </button>
              <button className="p-3 hover:bg-secondary rounded-full transition-colors duration-200">
                <User className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
