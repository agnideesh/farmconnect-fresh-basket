import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import ProfileImageUpload from '@/components/Profile/ProfileImageUpload';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Sun, Moon, MapPin, Lock, User, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Form schema for password change
const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Form schema for profile update
const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone_number: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
});

type PasswordForm = z.infer<typeof passwordSchema>;
type ProfileForm = z.infer<typeof profileSchema>;

const Settings: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  
  // Theme state (check if user prefers dark theme)
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(
    document.documentElement.classList.contains('dark')
  );
  
  // Location state (default to off)
  const [isLocationEnabled, setIsLocationEnabled] = useState<boolean>(
    localStorage.getItem('locationEnabled') === 'true'
  );

  // Password change form
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Profile update form
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      phone_number: profile?.phone_number || '',
      location: profile?.location || '',
      bio: profile?.bio || '',
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      if (!user) throw new Error("You must be logged in to update your profile");
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone_number: data.phone_number || null,
          location: data.location || null,
          bio: data.bio || null,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
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

  // Profile update handler
  const onSubmitProfileUpdate = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  // Handle profile image update
  const handleProfileImageUpdate = async (url: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: url || null })
        .eq('id', user.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile image",
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
            {/* Profile Section */}
            {user && (
              <div className="bg-card rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile
                </h2>
                
                <div className="flex flex-col items-center mb-6">
                  <ProfileImageUpload 
                    userId={user.id}
                    existingUrl={profile?.avatar_url}
                    onUploadComplete={handleProfileImageUpdate}
                  />
                </div>
                
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onSubmitProfileUpdate)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="min-h-[120px] resize-y"
                              placeholder="Tell us something about yourself..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="mt-2"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Update Profile
                    </Button>
                  </form>
                </Form>
              </div>
            )}
            
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
                
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onSubmitPasswordChange)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
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
                      control={passwordForm.control}
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
                      control={passwordForm.control}
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
