
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import AnimatedButton from '@/components/UI/AnimatedButton';
import { ArrowRight, Mail, Lock } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect to dashboard if already logged in
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { success, error, userType } = await signIn(email, password);

      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome back to Agree2Table!",
        });
        
        // Redirect based on user type
        if (userType === 'farmer') {
          navigate('/farmer-dashboard');
        } else {
          navigate('/user-dashboard');
        }
      } else {
        toast({
          title: "Login Failed",
          description: error || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Section - Login Form */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-16">
          <div className="w-full max-w-md">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-primary rounded-full opacity-20 animate-pulse-subtle"></div>
                <div className="absolute inset-0 flex items-center justify-center text-primary font-semibold text-xl">A2T</div>
              </div>
              <span className="text-2xl font-semibold">Agree2Table</span>
            </Link>
            
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground mb-8">Sign in to continue to your account</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <AnimatedButton
                type="submit"
                fullWidth
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </AnimatedButton>
            </form>

            <p className="mt-8 text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Right Section - Image & Info */}
        <div className="hidden md:flex md:w-1/2 bg-primary/5 items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">Farm to Table, Simplified</h2>
            <p className="mb-6 text-muted-foreground">
              Connect directly with local farmers, discover fresh produce, and support sustainable farming practices.
            </p>
            <div className="relative w-full aspect-square max-w-sm mx-auto overflow-hidden rounded-2xl">
              <img 
                src="https://images.unsplash.com/photo-1470072768013-bf9652973f44?q=80&w=1000&auto=format&fit=crop"
                alt="Fresh farm produce" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
