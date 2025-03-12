
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import AnimatedButton from '@/components/UI/AnimatedButton';
import { ArrowRight, Mail, Lock, User, Check } from 'lucide-react';

enum RegistrationType {
  SELECT,
  USER,
  FARMER
}

const Register = () => {
  const [registrationType, setRegistrationType] = useState<RegistrationType>(RegistrationType.SELECT);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect to dashboard if already logged in
      navigate('/');
    }
  }, [user, navigate]);

  const validateForm = () => {
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const userType = registrationType === RegistrationType.USER ? 'user' : 'farmer';
      
      const { success, error } = await signUp(email, password, {
        full_name: fullName,
        user_type: userType
      });

      if (success) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully. Please check your email for verification.",
        });
        navigate('/auth');
      } else {
        toast({
          title: "Registration Failed",
          description: error || "An error occurred during registration",
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

  const renderTypeSelection = () => (
    <div className="space-y-6 text-center">
      <h1 className="text-3xl font-bold mb-2">Join Agree2Table</h1>
      <p className="text-muted-foreground mb-8">Choose how you want to use our platform</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => setRegistrationType(RegistrationType.USER)}
          className="p-6 border border-border rounded-xl hover:border-primary hover:bg-primary/5 cursor-pointer transition-all"
        >
          <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">I'm a Customer</h3>
          <p className="text-muted-foreground text-sm">
            I want to browse and purchase fresh farm products directly from farmers.
          </p>
        </div>
        
        <div 
          onClick={() => setRegistrationType(RegistrationType.FARMER)}
          className="p-6 border border-border rounded-xl hover:border-primary hover:bg-primary/5 cursor-pointer transition-all"
        >
          <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 5L21 9M3 9V16.5L12 20.5M3 9L7.5 7.5M21 9V16.5L12 20.5M21 9L16.5 7.5M12 20.5V13.5M7.5 7.5V14L12 13.5M7.5 7.5L12 9M16.5 7.5V14L12 13.5M16.5 7.5L12 9M12 9V13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="font-semibold text-lg mb-2">I'm a Farmer</h3>
          <p className="text-muted-foreground text-sm">
            I want to sell my farm products directly to consumers without middlemen.
          </p>
        </div>
      </div>
      
      <p className="mt-8 text-center text-muted-foreground">
        Already have an account?{' '}
        <Link to="/auth" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );

  const renderRegistrationForm = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-8">
        <button 
          onClick={() => setRegistrationType(RegistrationType.SELECT)} 
          className="mr-4 p-2 hover:bg-secondary rounded-full transition-colors"
        >
          <ArrowRight className="w-5 h-5 transform rotate-180" />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Create Your Account</h1>
          <p className="text-muted-foreground">
            Join as a {registrationType === RegistrationType.USER ? 'Customer' : 'Farmer'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="John Doe"
              required
            />
          </div>
        </div>

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

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
          <div className="relative">
            <Check className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
          {isLoading ? 'Creating account...' : 'Create Account'}
        </AnimatedButton>
      </form>

      <p className="mt-8 text-center text-muted-foreground">
        Already have an account?{' '}
        <Link to="/auth" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Section - Registration Form */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-16">
          <div className="w-full max-w-md">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-primary rounded-full opacity-20 animate-pulse-subtle"></div>
                <div className="absolute inset-0 flex items-center justify-center text-primary font-semibold text-xl">A2T</div>
              </div>
              <span className="text-2xl font-semibold">Agree2Table</span>
            </Link>
            
            {registrationType === RegistrationType.SELECT 
              ? renderTypeSelection() 
              : renderRegistrationForm()}
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
                src={registrationType === RegistrationType.FARMER 
                  ? "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1000&auto=format&fit=crop" 
                  : "https://images.unsplash.com/photo-1506617420156-8e4536971650?q=80&w=1000&auto=format&fit=crop"}
                alt="Farm to table" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
