import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import FarmerCard, { FarmerData } from '@/components/Farmers/FarmerCard';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Users } from 'lucide-react';
import FadeInSection from '@/components/UI/FadeInSection';

const FarmersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: farmers, isLoading, error } = useQuery({
    queryKey: ['farmers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'farmer');
      
      if (error) throw new Error(error.message);
      return data as FarmerData[];
    }
  });

  const filteredFarmers = farmers?.filter(farmer => 
    farmer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.specialties?.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <FadeInSection className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">Meet Our Farmers</h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto">
            Discover our network of local farmers committed to sustainable agriculture 
            and providing fresh, native products directly to your table.
          </p>
        </FadeInSection>
        
        <div className="relative max-w-md mx-auto mb-8">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <Input
            placeholder="Search by name, location, or specialty..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        
        
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-destructive">
            <p>Error loading farmers. Please try again later.</p>
          </div>
        ) : filteredFarmers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No farmers found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try a different search term' : 'There are no farmers registered yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFarmers.map((farmer) => (
              <FadeInSection key={farmer.id} className="h-full">
                <FarmerCard farmer={farmer} />
              </FadeInSection>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default FarmersList;
