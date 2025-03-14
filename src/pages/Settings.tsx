
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Sun, Moon, MapPin, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Form schema for password change
const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

const Settings: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Theme state (check if user prefers dark theme)
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(
    document.documentElement.classList.contains('dark')
  );
  
  // Location state (default to off)
  const [isLocationEnabled, setIsLocationEnabled] = useState<boolean>(
    localStorage.getItem('locationEnabled') === 'true'
  );

  // Password change form
  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Theme toggle handler
  const handleThemeToggle = () => {
    if (isDarkTheme) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkTheme(!isDarkTheme);
    
    toast({
      title: "Theme Updated",
      description: `Theme switched to ${!isDarkTheme ? 'dark' : 'light'} mode`,
    });
  };

  // Location toggle handler
  const handleLocationToggle = () => {
    const newValue = !isLocationEnabled;
    setIsLocationEnabled(newValue);
    localStorage.setItem('locationEnabled', newValue.toString());
    
    if (newValue) {
      // Request location permission when enabled
      navigator.geolocation.getCurrentPosition(
        () => {
          toast({
            title: "Location Enabled",
            description: "Your location is now being used to enhance your experience",
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Could not access your location. Please check browser permissions.",
            variant: "destructive",
          });
          // Reset switch if permission denied
          setIsLocationEnabled(false);
          localStorage.setItem('locationEnabled', 'false');
        }
      );
    } else {
      toast({
        title: "Location Disabled",
        description: "Location services have been turned off",
      });
    }
  };

  // Password change handler
  const onSubmitPasswordChange = async (data: PasswordForm) => {
    try {
      // First verify the current password is correct
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: data.currentPassword,
      });

      if (signInError) throw new Error("Current password is incorrect");
      
      // If verification passed, update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword
      });
      
      if (updateError) throw updateError;
      
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully",
      });
      
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-8">Settings</h1>
          
          <div className="space-y-8">
            {/* Appearance Section */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5" />
                <Moon className="w-5 h-5" />
                Appearance
              </h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme-mode" className="text-base font-medium">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch 
                  id="theme-mode" 
                  checked={isDarkTheme}
                  onCheckedChange={handleThemeToggle}
                />
              </div>
            </div>
            
            {/* Location Section */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="location-toggle" className="text-base font-medium">
                    Enable Location Services
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow the app to use your location for enhanced features
                  </p>
                </div>
                <Switch 
                  id="location-toggle" 
                  checked={isLocationEnabled}
                  onCheckedChange={handleLocationToggle}
                />
              </div>
            </div>
            
            {/* Password Change Section */}
            {user && (
              <div className="bg-card rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security
                </h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitPasswordChange)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="mt-2">
                      Change Password
                    </Button>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
