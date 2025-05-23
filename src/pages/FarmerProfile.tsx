import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import ProductCard from '@/components/Products/ProductCard';
import FarmerLocationMap from '@/components/Map/FarmerLocationMap';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, MapPin, Phone, Mail, Tractor, Leaf, UserPlus, UserMinus } from 'lucide-react';
import { FarmerData } from '@/components/Farmers/FarmerCard';
import FadeInSection from '@/components/UI/FadeInSection';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const FarmerProfile = () => {
  const { farmerId } = useParams<{ farmerId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  const { data: farmer, isLoading: isLoadingFarmer } = useQuery({
    queryKey: ['farmer', farmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', farmerId)
        .eq('user_type', 'farmer')
        .single();
      
      if (error) throw new Error(error.message);
      return data as FarmerData;
    },
    enabled: !!farmerId,
  });
  
  const { data: isFollowing, refetch: refetchFollowStatus } = useQuery({
    queryKey: ['isFollowing', user?.id, farmerId],
    queryFn: async () => {
      if (!user || !farmerId) return false;
      
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('user_id', user.id)
        .eq('farmer_id', farmerId)
        .maybeSingle();
      
      if (error) throw new Error(error.message);
      return !!data;
    },
    enabled: !!user && !!farmerId,
  });
  
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['farmerProducts', farmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('farmer_id', farmerId);
      
      if (error) throw new Error(error.message);
      
      return data.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.image_url || '/placeholder.svg',
        farmer: {
          id: farmer?.id || '',
          name: farmer?.full_name || 'Unknown Farmer',
          location: farmer?.location || 'Unknown Location',
          avatar: farmer?.avatar_url || undefined,
          email: farmer?.email || undefined,
          coordinates: farmer?.latitude && farmer?.longitude ? {
            latitude: farmer.latitude,
            longitude: farmer.longitude
          } : undefined
        }
      }));
    },
    enabled: !!farmerId && !!farmer,
  });
  
  const handleFollowToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow farmers",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    setIsFollowLoading(true);
    
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('user_id', user.id)
          .eq('farmer_id', farmerId);
          
        if (error) throw error;
        
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${farmer?.full_name}`,
        });
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            user_id: user.id,
            farmer_id: farmerId,
          });
          
        if (error) throw error;
        
        toast({
          title: "Following",
          description: `You are now following ${farmer?.full_name}`,
        });
      }
      
      refetchFollowStatus();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setIsFollowLoading(false);
    }
  };
  
  const isLoading = isLoadingFarmer || isLoadingProducts;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!farmer) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <Tractor className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Farmer Not Found</h2>
          <p className="text-muted-foreground mb-6 text-center">
            The farmer you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/farmers')}>
            View All Farmers
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/farmers')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Farmers
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <FadeInSection>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-primary/10">
                  <AvatarImage src={farmer.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">{farmer.full_name?.charAt(0) || 'F'}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold mb-2">{farmer.full_name}</h1>
                    
                    {user && user.id !== farmer.id && (
                      <Button
                        variant={isFollowing ? "default" : "outline"}
                        size="sm"
                        onClick={handleFollowToggle}
                        disabled={isFollowLoading}
                        className="w-full sm:w-auto"
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus className="mr-2 h-4 w-4" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Follow
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {farmer.location && (
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{farmer.location}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 my-3">
                    {farmer.specialties?.map((specialty, index) => (
                      <span 
                        key={index} 
                        className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                      >
                        <Leaf className="h-3 w-3" />
                        {specialty}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-4">
                    {farmer.phone_number && (
                      <a 
                        href={`tel:${farmer.phone_number}`}
                        className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        {farmer.phone_number}
                      </a>
                    )}
                    
                    {farmer.email && (
                      <a 
                        href={`mailto:${farmer.email}`}
                        className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        {farmer.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              {farmer.bio && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-2">About</h2>
                  <p className="text-muted-foreground">{farmer.bio}</p>
                </div>
              )}
            </FadeInSection>
          </div>
          
          <div className="lg:col-span-1">
            <FadeInSection>
              {farmer.latitude && farmer.longitude ? (
                <div className="rounded-lg overflow-hidden border">
                  <FarmerLocationMap 
                    location={{
                      latitude: farmer.latitude,
                      longitude: farmer.longitude
                    }}
                    farmerName={farmer.full_name || 'Farmer'}
                  />
                </div>
              ) : (
                <div className="rounded-lg border bg-muted/50 h-64 flex items-center justify-center">
                  <div className="text-center p-4">
                    <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Location not available</p>
                  </div>
                </div>
              )}
            </FadeInSection>
          </div>
        </div>
        
        <FadeInSection>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
            <TabsList className="grid w-full md:w-auto grid-cols-2">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="about">Farm Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="pt-6">
              <h2 className="text-2xl font-semibold mb-6">Products by {farmer.full_name}</h2>
              
              {products && products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Tractor className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-xl font-semibold mb-2">No Products Available</h3>
                  <p className="text-muted-foreground">
                    This farmer hasn't added any products yet.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="about" className="pt-6">
              <h2 className="text-2xl font-semibold mb-6">About the Farm</h2>
              
              <div className="bg-card rounded-lg p-6 border">
                {farmer.bio ? (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Farm Description</h3>
                    <p className="text-muted-foreground">{farmer.bio}</p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Farm Description</h3>
                    <p className="text-muted-foreground italic">No description available</p>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Specialties</h3>
                  {farmer.specialties && farmer.specialties.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {farmer.specialties.map((specialty, index) => (
                        <span 
                          key={index} 
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No specialties listed</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  {farmer.location ? (
                    <p className="text-muted-foreground">{farmer.location}</p>
                  ) : (
                    <p className="text-muted-foreground italic">Location not specified</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </FadeInSection>
      </main>
      
      <Footer />
    </div>
  );
};

export default FarmerProfile;
