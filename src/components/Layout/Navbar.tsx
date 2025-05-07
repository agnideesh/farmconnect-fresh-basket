
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import AnimatedButton from '@/components/UI/AnimatedButton';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, X, LogOut, Settings, LineChart } from 'lucide-react';

const NavLinks = () => {
  const { user } = useAuth();
  
  // Determine user type based on the user object
  const userType = user?.user_metadata?.user_type || null;
  
  const links = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Farmers",
      href: "/farmers",
    },
    {
      label: "Market Prices",
      href: "/market-data",
      icon: <LineChart className="h-4 w-4" />,
    },
  ];
  
  if (userType === 'user') {
    links.push({
      label: "Dashboard",
      href: "/user-dashboard",
    });
  } else if (userType === 'farmer') {
    links.push({
      label: "Dashboard",
      href: "/farmer-dashboard",
    });
  }
  
  return (
    <>
      {links.map((link) => (
        <NavLink
          key={link.label}
          to={link.href}
          className={({ isActive }) =>
            `block py-2 pr-4 pl-3 md:p-0 text-sm font-semibold rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 hover:text-primary ${isActive ? 'text-primary' : 'text-gray-700'
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </>
  );
};

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center">
          <img
            src="/logo.svg"
            className="h-8 mr-3"
            alt="FarmConnect Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            FarmConnect
          </span>
        </Link>
        <div className="flex md:order-2 gap-4 items-center">
          <ThemeToggle />
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <AnimatedButton variant="ghost" className="relative w-8 h-8 rounded-full">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile?.avatar_url || "https://avatars.dicebear.com/api/open-peeps/example.svg"} alt={profile?.full_name} />
                      <AvatarFallback>{profile?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </AnimatedButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mr-2">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <AnimatedButton onClick={() => navigate('/auth')}>Get Started</AnimatedButton>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <AnimatedButton variant="ghost" className="md:hidden" onClick={toggleMenu}>
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </AnimatedButton>
            </SheetTrigger>
            <SheetContent side="right" className="sm:w-2/3 md:w-1/2">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Explore and manage your account settings.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4">
                <NavLinks />
                {user ? (
                  <div className="mt-6 space-y-2">
                    <AnimatedButton variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </AnimatedButton>
                    <AnimatedButton variant="outline" className="w-full justify-start gap-2 text-red-500 hover:text-red-700" onClick={() => signOut()}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </AnimatedButton>
                  </div>
                ) : (
                  <AnimatedButton className="w-full" onClick={() => navigate('/auth')}>Get Started</AnimatedButton>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${isMenuOpen ? '' : 'hidden'}`} id="navbar-sticky">
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <NavLinks />
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
