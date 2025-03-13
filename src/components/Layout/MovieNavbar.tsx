
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedButton from '../UI/AnimatedButton';
import { LogIn, LogOut, Settings, Film, Layers, User, Home } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';

const MovieNavbar = () => {
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
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
            <Film className="w-5 h-5" />
            MovieView
          </Link>

          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Browse</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px] grid-cols-2">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/50 to-primary p-6 no-underline outline-none focus:shadow-md"
                            href="/"
                          >
                            <Film className="h-6 w-6" />
                            <div className="mb-2 mt-4 text-lg font-medium text-white">
                              Movie Collection
                            </div>
                            <p className="text-sm leading-tight text-white/90">
                              Browse our entire collection of movies and shows
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/categories/action" title="Action" icon={<Layers className="w-4 h-4" />}>
                        Thrilling action movies
                      </ListItem>
                      <ListItem href="/categories/comedy" title="Comedy" icon={<Layers className="w-4 h-4" />}>
                        Laugh out loud comedies
                      </ListItem>
                      <ListItem href="/categories/drama" title="Drama" icon={<Layers className="w-4 h-4" />}>
                        Engaging drama films
                      </ListItem>
                      <ListItem href="/new-releases" title="New Releases" icon={<Layers className="w-4 h-4" />}>
                        Recently added movies
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/dashboard" className={navigationMenuTriggerStyle()}>
                    <Home className="w-4 h-4 mr-1" />
                    Dashboard
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/settings" className={navigationMenuTriggerStyle()}>
                    <Settings className="w-4 h-4 mr-1" />
                    Settings
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-2">
            {user && profile ? (
              <>
                <div className="hidden md:block text-sm font-medium">
                  <Link 
                    to={profile.user_type === 'farmer' ? '/farmer-dashboard' : '/user-dashboard'}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <User className="w-4 h-4" />
                    {profile.full_name || 'Dashboard'}
                  </Link>
                </div>
                <AnimatedButton
                  variant="outline"
                  onClick={handleSignOut}
                  icon={<LogOut className="w-4 h-4" />}
                  iconPosition="left"
                  size="sm"
                >
                  <span className="hidden sm:inline">Sign Out</span>
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
                    <span className="hidden sm:inline">Sign In</span>
                  </AnimatedButton>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border">
        <div className="flex justify-around py-2">
          <Link to="/" className="flex flex-col items-center p-2 text-xs">
            <Home className="w-5 h-5 mb-1" />
            Home
          </Link>
          <Link to="/dashboard" className="flex flex-col items-center p-2 text-xs">
            <Layers className="w-5 h-5 mb-1" />
            Browse
          </Link>
          <Link to={user && profile ? '/profile' : '/auth'} className="flex flex-col items-center p-2 text-xs">
            <User className="w-5 h-5 mb-1" />
            {user && profile ? 'Profile' : 'Sign In'}
          </Link>
          <Link to="/settings" className="flex flex-col items-center p-2 text-xs">
            <Settings className="w-5 h-5 mb-1" />
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon?: React.ReactNode }
>(({ className, title, children, icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center text-sm font-medium leading-none">
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default MovieNavbar;
