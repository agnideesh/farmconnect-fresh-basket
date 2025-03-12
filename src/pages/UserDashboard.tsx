
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import AnimatedButton from '@/components/UI/AnimatedButton';
import { ShoppingBag, Heart, Settings, LogOut } from 'lucide-react';

const UserDashboard = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome, {profile?.full_name || 'User'}</h1>
            <p className="text-muted-foreground">Manage your account and explore fresh farm products</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white shadow-sm rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">My Orders</h3>
                <div className="p-2 bg-primary/10 rounded-full">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-muted-foreground text-sm">Total orders placed</p>
            </div>
            
            <div className="bg-white shadow-sm rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Saved Items</h3>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-muted-foreground text-sm">Products in your wishlist</p>
            </div>
            
            <div className="bg-white shadow-sm rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Account</h3>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Manage your account settings</p>
              <AnimatedButton 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
                icon={<LogOut className="w-4 h-4" />}
                iconPosition="left"
              >
                Sign Out
              </AnimatedButton>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Recent Products</h2>
            <div className="bg-secondary/50 rounded-xl p-12 text-center">
              <p className="text-muted-foreground">No recent products to display</p>
              <AnimatedButton 
                className="mt-4"
                icon={<ShoppingBag className="w-5 h-5" />}
                iconPosition="left"
                onClick={() => navigate('/')}
              >
                Start Shopping
              </AnimatedButton>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;
