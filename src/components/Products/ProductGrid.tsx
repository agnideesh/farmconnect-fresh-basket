import React, { useState, useEffect } from 'react';
import ProductCard, { Product } from './ProductCard';
import { Search, MapPin, List, Grid as GridIcon } from 'lucide-react';
import FadeInSection from '../UI/FadeInSection';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

interface ProductGridProps {
  selectedCategory: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({ selectedCategory }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (navigator.geolocation && isLocationEnabled) {
      setLocationError(null);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          toast({
            title: "Location updated",
            description: "Using your current location to find nearby products",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          let errorMessage = "Could not access your location.";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          
          setLocationError(errorMessage);
          toast({
            title: "Location error",
            description: errorMessage,
            variant: "destructive",
          });
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      toast({
        title: "Location not supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  }, [isLocationEnabled]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return Math.round(d * 10) / 10; // Round to 1 decimal place
  };
  
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', userLocation],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products_with_farmer_details')
        .select('*');
      
      if (error) throw error;
      
      return data.map(item => {
        let distance: number | undefined;
        
        if (userLocation) {
          if (item.latitude && item.longitude) {
            distance = calculateDistance(
              userLocation.latitude, 
              userLocation.longitude, 
              item.latitude, 
              item.longitude
            );
          } 
          else if (item.farmer_id) {
            const getFarmerCoordinates = async (farmerId: string) => {
              const { data } = await supabase
                .from('profiles')
                .select('latitude, longitude')
                .eq('id', farmerId)
                .single();
                
              return data;
            };
            
            const farmerLat = 12.9716 + (Math.random() * 0.05 - 0.025);
            const farmerLng = 77.5946 + (Math.random() * 0.05 - 0.025);
            
            distance = calculateDistance(
              userLocation.latitude, 
              userLocation.longitude, 
              farmerLat, 
              farmerLng
            );
          } else {
            distance = Math.floor(Math.random() * 50) + 1;
          }
        }
          
        return {
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          quantity: item.quantity,
          farmer: {
            id: item.farmer_id || '101',
            name: item.farmer_name || 'Unknown Farmer',
            location: item.farmer_location || 'Local Farm',
            phone: item.farmer_phone,
            email: item.farmer_email,
            avatar: item.farmer_avatar,
            coordinates: item.latitude && item.longitude ? {
              latitude: item.latitude,
              longitude: item.longitude
            } : undefined
          },
          coordinates: item.latitude && item.longitude ? {
            latitude: item.latitude,
            longitude: item.longitude
          } : undefined,
          image: item.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfad?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
          organic: Math.random() > 0.5,
          native: Math.random() > 0.5,
          distance: distance
        };
      });
    },
    enabled: true,
    refetchInterval: isLocationEnabled ? 30000 : false,
  });

  const filteredProducts = React.useMemo(() => {
    let filtered = (products || []).filter(product => {
      const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
      
      const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.farmer.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return categoryMatch && searchMatch;
    });

    if (isLocationEnabled && userLocation) {
      filtered = filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    }

    return filtered;
  }, [products, selectedCategory, searchQuery, isLocationEnabled, userLocation]);

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container px-6 mx-auto">
          <div className="text-center py-20">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded-full w-48 mx-auto mb-4"></div>
              <div className="h-8 bg-gray-200 rounded-full w-64 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8">
        <div className="container px-6 mx-auto">
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-red-600 mb-2">Error loading products</h3>
            <p className="text-muted-foreground">Please try again later</p>
          </div>
        </div>
      </section>
    );
  }

  const displayProducts = products && products.length > 0 ? filteredProducts : sampleProducts.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    
    const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.farmer.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  const LocationToggle = () => (
    <button
      onClick={() => setIsLocationEnabled(!isLocationEnabled)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
        isLocationEnabled 
          ? locationError 
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      } transition-colors`}
    >
      <MapPin className={`w-4 h-4 ${locationError ? 'text-red-600' : ''}`} />
      <span className="text-sm">
        {isLocationEnabled 
          ? locationError 
            ? 'Location Error' 
            : 'Location On' 
          : 'Enable Location'}
      </span>
    </button>
  );

  const FilterSection = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h2 className="text-2xl font-bold">
        {selectedCategory === 'all' ? 'Featured Products' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
        <span className="text-sm font-normal text-muted-foreground ml-2">({filteredProducts.length} products)</span>
      </h2>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <LocationToggle />
        
        <div className="flex rounded-lg overflow-hidden border border-border">
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex items-center justify-center p-2 ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'bg-white'}`}
          >
            <GridIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center justify-center p-2 ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'bg-white'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
        
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 z-10 pointer-events-none">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="Search products or farmers..."
            className="w-full sm:w-64 pl-10 pr-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const MobileFilters = () => (
    <>
      {isMobile ? (
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {selectedCategory === 'all' ? 'Featured Products' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
          </h2>
          
          <Sheet>
            <SheetTrigger className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg">
              <Search className="w-4 h-4" />
              <span className="text-sm">Filters</span>
            </SheetTrigger>
            <SheetContent side="bottom" className="sm:max-w-md mx-auto rounded-t-xl">
              <SheetHeader>
                <SheetTitle>Search & Filters</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 z-10 pointer-events-none">
                    <Search className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search products or farmers..."
                    className="w-full pl-10 pr-4 py-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">View Mode</span>
                  <div className="flex rounded-lg overflow-hidden border border-border">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center justify-center p-2 ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'bg-white'}`}
                    >
                      <GridIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`flex items-center justify-center p-2 ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'bg-white'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Location</span>
                  <LocationToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      ) : (
        <FilterSection />
      )}
    </>
  );

  return (
    <section className="py-8">
      <div className="container px-6 mx-auto">
        <MobileFilters />
        
        {locationError && isLocationEnabled && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <p>{locationError}</p>
            <p className="mt-1 text-xs">You can still browse products, but distance information may not be accurate.</p>
          </div>
        )}
        
        {displayProducts.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "flex flex-col gap-4"
          }>
            {displayProducts.map((product, index) => (
              <FadeInSection key={product.id} delay={index * 100} className="h-full">
                <ProductCard product={product} view={viewMode} />
              </FadeInSection>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">No products found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </section>
  );
};

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Tomatoes',
    category: 'vegetables',
    price: 80,
    farmer: {
      id: '101',
      name: 'Anand Farms',
      location: 'Bangalore Rural',
      phone: '+91 9876543210',
      email: 'anand@farms.com',
      coordinates: {
        latitude: 12.9716,
        longitude: 77.5946
      }
    },
    image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800',
    distance: 12,
    organic: true,
    native: false
  },
  {
    id: '2',
    name: 'Fresh Strawberries',
    category: 'fruits',
    price: 220,
    farmer: {
      id: '102',
      name: 'Himachal Growers',
      location: 'Shimla',
      phone: '+91 9876543211',
      email: 'info@himachalgrowers.com',
      coordinates: {
        latitude: 31.1048,
        longitude: 77.1734
      }
    },
    image: 'https://images.pexels.com/photos/70746/strawberries-red-fruit-royalty-free-70746.jpeg?auto=compress&cs=tinysrgb&w=800',
    distance: 45,
    organic: true,
    native: true
  },
  {
    id: '3',
    name: 'Tulsi Leaves',
    category: 'herbs',
    price: 40,
    farmer: {
      id: '103',
      name: 'Kerala Herbs',
      location: 'Kochi',
      phone: '+91 9876543212',
      email: 'contact@keralaherbs.com',
      coordinates: {
        latitude: 9.9312,
        longitude: 76.2673
      }
    },
    image: 'https://images.pexels.com/photos/5505638/pexels-photo-5505638.jpeg?auto=compress&cs=tinysrgb&w=800',
    distance: 22,
    organic: true,
    native: true
  },
  {
    id: '4',
    name: 'Marigold Garlands',
    category: 'flowers',
    price: 120,
    farmer: {
      id: '104',
      name: 'Tamil Blooms',
      location: 'Coimbatore',
      phone: '+91 9876543213',
      email: 'sales@tamilblooms.com',
      coordinates: {
        latitude: 11.0168,
        longitude: 76.9558
      }
    },
    image: 'https://images.pexels.com/photos/1034440/pexels-photo-1034440.jpeg?auto=compress&cs=tinysrgb&w=800',
    distance: 18,
    organic: false,
    native: true
  },
  {
    id: '5',
    name: 'Coconut Oil',
    category: 'byproducts',
    price: 350,
    farmer: {
      id: '105',
      name: 'Kerala Coco',
      location: 'Trivandrum',
      phone: '+91 9876543214',
      email: 'orders@keralacoco.com',
      coordinates: {
        latitude: 8.5241,
        longitude: 76.9366
      }
    },
    image: 'https://images.pexels.com/photos/47483/olive-oil-salad-dressing-cooking-olive-47483.jpeg?auto=compress&cs=tinysrgb&w=800',
    distance: 30,
    organic: false,
    native: true
  },
  {
    id: '6',
    name: 'Spinach',
    category: 'vegetables',
    price: 60,
    farmer: {
      id: '101',
      name: 'Anand Farms',
      location: 'Bangalore Rural',
      phone: '+91 9876543210',
      email: 'anand@farms.com',
      coordinates: {
        latitude: 12.9716,
        longitude: 77.5946
      }
    },
    image: 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&w=800',
    distance: 12,
    organic: true,
    native: true
  },
  {
    id: '7',
    name: 'Fresh Mangoes',
    category: 'fruits',
    price: 180,
    farmer: {
      id: '106',
      name: 'Ratnagiri Fruits',
      location: 'Ratnagiri',
      phone: '+91 9876543215',
      email: 'mangoes@ratnagirifruits.com',
      coordinates: {
        latitude: 16.9924,
        longitude: 73.3120
      }
    },
    image: 'https://images.pexels.com/photos/918643/pexels-photo-918643.jpeg?auto=compress&cs=tinysrgb&w=800',
    distance: 55,
    organic: false,
    native: true
  },
  {
    id: '8',
    name: 'Mint Leaves',
    category: 'herbs',
    price: 30,
    farmer: {
      id: '103',
      name: 'Kerala Herbs',
      location: 'Kochi',
      phone: '+91 9876543212',
      email: 'contact@keralaherbs.com',
      coordinates: {
        latitude: 9.9312,
        longitude: 76.2673
      }
    },
    image: 'https://images.pexels.com/photos/4207783/pexels-photo-4207783.jpeg?auto=compress&cs=tinysrgb&w=800',
    distance: 22,
    organic: true,
    native: false
  }
];

export default ProductGrid;
