import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, User, Search } from 'lucide-react';
import AnimatedButton from '../UI/AnimatedButton';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
          <button className="p-2 hover:bg-secondary rounded-full transition-colors duration-200">
            <User className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-secondary rounded-full transition-colors duration-200 relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              0
            </span>
          </button>
          <AnimatedButton size="sm">Sign In</AnimatedButton>
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
            <AnimatedButton fullWidth size="lg">
              Sign In
            </AnimatedButton>
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
