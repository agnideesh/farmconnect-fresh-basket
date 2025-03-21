
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import FarmerCard, { FarmerData } from '@/components/Farmers/FarmerCard';
import ProductCard from '@/components/Products/ProductCard';
import AnimatedButton from '@/components/UI/AnimatedButton';
import FadeInSection from '@/components/UI/FadeInSection';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ShoppingBag, Heart, Settings, Users, Tractor, Loader2 } from 'lucide-react';

const UserDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('following');
  
  // Fetch followed farmers
  const { data: followedFarmers, isLoading: isLoadingFarmers, refetch: refetchFarmers } = useQuery({
    queryKey: ['followedFarmers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // First get all the farmer IDs the user follows
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select('farmer_id')
        .eq('user_id', user.id);
        
      if (followsError) throw followsError;
      
      if (!followsData || followsData.length === 0) {
        return [];
      }
      
      // Get the farmer details for each followed farmer
      const farmerIds = followsData.map(follow => follow.farmer_id);
      const { data: farmersData, error: farmersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'farmer')
        .in('id', farmerIds);
        
      if (farmersError) throw farmersError;
      
      return farmersData as FarmerData[];
    },
    enabled: !!user,
  });
  
  // Fetch recommended products (from followed farmers)
  const { data: recommendedProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['recommendedProducts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('followed_farmer_products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
        
      if (error) throw error;
      
      // Match the format expected by ProductCard
      return data.map(product => {
        const farmer = followedFarmers?.find(f => f.id === product.farmer_id);
        
        return {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          quantity: product.quantity,
          image: product.image_url || '/placeholder.svg',
          farmer: {
            id: product.farmer_id || '',
            name: farmer?.full_name || 'Unknown Farmer',
            location: farmer?.location || 'Unknown Location',
            avatar: farmer?.avatar_url,
            email: farmer?.email,
            phone: farmer?.phone_number,
            coordinates: farmer?.latitude && farmer?.longitude ? {
              latitude: farmer.latitude,
              longitude: farmer.longitude
            } : undefined
          }
        };
      });
    },
    enabled: !!user && !!followedFarmers,
  });
  
  const handleFollowChange = (farmerId: string, isFollowed: boolean) => {
    // Refetch the followed farmers list after follow/unfollow
    refetchFarmers();
  };
  
  const isLoading = isLoadingFarmers || isLoadingProducts;

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
                <h3 className="font-semibold">Following</h3>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold">{followedFarmers?.length || 0}</p>
              <p className="text-muted-foreground text-sm">Farmers you're following</p>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="following" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Following
              </TabsTrigger>
              <TabsTrigger value="recommended" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Recommended Products
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="following">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Farmers You Follow</h2>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/farmers')}
                  className="flex items-center gap-2"
                >
                  <Tractor className="w-4 h-4" />
                  Discover Farmers
                </Button>
              </div>
              
              {isLoadingFarmers ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : followedFarmers && followedFarmers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {followedFarmers.map(farmer => (
                    <FadeInSection key={farmer.id} className="h-full">
                      <FarmerCard 
                        farmer={farmer} 
                        isFollowed={true}
                        onFollowChange={handleFollowChange}
                      />
                    </FadeInSection>
                  ))}
                </div>
              ) : (
                <div className="bg-secondary/50 rounded-xl p-12 text-center">
                  <Tractor className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">You're not following any farmers yet</p>
                  <AnimatedButton 
                    icon={<Users className="w-5 h-5" />}
                    iconPosition="left"
                    onClick={() => navigate('/farmers')}
                  >
                    Find Farmers to Follow
                  </AnimatedButton>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recommended">
              <div className="mb-4">
                <h2 className="text-2xl font-bold">Recommended Products</h2>
                <p className="text-muted-foreground">Fresh products from farmers you follow</p>
              </div>
              
              {isLoadingProducts ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : recommendedProducts && recommendedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedProducts.map(product => (
                    <FadeInSection key={product.id} className="h-full">
                      <ProductCard product={product} />
                    </FadeInSection>
                  ))}
                </div>
              ) : (
                <div className="bg-secondary/50 rounded-xl p-12 text-center">
                  <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {followedFarmers && followedFarmers.length > 0 
                      ? "Farmers you follow haven't posted any products yet" 
                      : "Follow farmers to see their products here"}
                  </p>
                  <AnimatedButton 
                    icon={<Users className="w-5 h-5" />}
                    iconPosition="left"
                    onClick={() => navigate('/farmers')}
                  >
                    {followedFarmers && followedFarmers.length > 0 
                      ? "Find More Farmers" 
                      : "Find Farmers to Follow"}
                  </AnimatedButton>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;
