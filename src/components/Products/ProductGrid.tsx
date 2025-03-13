
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
  const isMobile = useIsMobile();
  
  // Get user's location
  useEffect(() => {
    if (navigator.geolocation && isLocationEnabled) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          toast({
            title: "Location updated",
            description: "Using your current location to find nearby farms",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location error",
            description: "Could not access your location. Please check permissions.",
            variant: "destructive",
          });
        }
      );
    }
  }, [isLocationEnabled]);

  // Calculate distance between two points using Haversine formula
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
    return Math.round(d);
  };
  
  // Fetch products from Supabase
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', userLocation],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products_with_farmer_details')
        .select('*');
      
      if (error) throw error;
      
      // Farm location coordinates for each farmer (in a real app, these would come from the database)
      const farmerCoordinates: Record<string, {latitude: number, longitude: number}> = {
        // Predefined farmer coordinates
        '101': { latitude: 12.9716, longitude: 77.5946 }, // Bangalore
        '102': { latitude: 31.1048, longitude: 77.1734 }, // Shimla
        '103': { latitude: 9.9312, longitude: 76.2673 },  // Kochi
        '104': { latitude: 11.0168, longitude: 76.9558 }, // Coimbatore
        '105': { latitude: 8.5241, longitude: 76.9366 },  // Trivandrum
        '106': { latitude: 16.9924, longitude: 73.3120 }  // Ratnagiri
      };
      
      return data.map(item => {
        // Generate random coordinates near the predefined location for each farmer
        // In a real app, you would use actual coordinates from the database
        const farmerId = item.farmer_id || '101'; // Default to first farmer if none
        
        // Get base coordinates for the farmer or use a default
        const baseCoordinates = farmerCoordinates[farmerId] || { 
          latitude: 12.9716, 
          longitude: 77.5946 
        }; 
        
        // Add a small random offset to make each farm location unique
        // In a real app, you would use actual precise coordinates for each farm
        const coordinates = {
          latitude: baseCoordinates.latitude + (Math.random() * 0.05 - 0.025),
          longitude: baseCoordinates.longitude + (Math.random() * 0.05 - 0.025)
        };
        
        // Calculate distance if user location is available
        const distance = userLocation 
          ? calculateDistance(
              userLocation.latitude, 
              userLocation.longitude, 
              coordinates.latitude, 
              coordinates.longitude
            ) 
          : Math.floor(Math.random() * 50) + 1;
          
        return {
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          farmer: {
            id: item.farmer_id || '101',
            name: item.farmer_name || 'Unknown Farmer',
            location: 'Local Farm',
            phone: item.farmer_phone,
            email: item.farmer_email,
            avatar: item.farmer_avatar,
            coordinates: coordinates
          },
          image: item.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfad?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
          organic: Math.random() > 0.5, // Placeholder, you can add this field to your DB
          native: Math.random() > 0.5,  // Placeholder, you can add this field to your DB
          distance: distance
        };
      });
    },
    enabled: true,
    refetchInterval: isLocationEnabled ? 30000 : false, // Refetch every 30 seconds if location is enabled
  });
  
  // Filter products based on category, search query, and sort by distance if location is enabled
  const filteredProducts = React.useMemo(() => {
    let filtered = (products || []).filter(product => {
      // Filter by category
      const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
      
      // Filter by search query
      const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.farmer.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return categoryMatch && searchMatch;
    });

    // Sort by distance if location is enabled
    if (isLocationEnabled && userLocation) {
      filtered = filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return filtered;
  }, [products, selectedCategory, searchQuery, isLocationEnabled, userLocation]);

  // Show loading state
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

  // Show error state
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

  // Use sample data if no products are loaded yet
  // This is a fallback in case there's no data in the database yet
  const displayProducts = products && products.length > 0 ? filteredProducts : sampleProducts.filter(product => {
    // Filter by category
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    
    // Filter by search query
    const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.farmer.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  const LocationToggle = () => (
    <button
      onClick={() => setIsLocationEnabled(!isLocationEnabled)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
        isLocationEnabled 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      } transition-colors`}
    >
      <MapPin className="w-4 h-4" />
      <span className="text-sm">
        {isLocationEnabled ? 'Location On' : 'Enable Location'}
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
        {/* Location toggle */}
        <LocationToggle />
        
        {/* View mode toggle */}
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
        
        {/* Search */}
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search products or farmers..."
            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-border rounded-lg bg-white/50 focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  // Mobile filters in drawer/sheet
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
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products or farmers..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-white/50 focus:outline-none focus:ring-1 focus:ring-primary"
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
  
  // Filter products based on category, search query, and sort by distance if location is enabled
  const filteredProducts = React.useMemo(() => {
    let filtered = (products || []).filter(product => {
      // Filter by category
      const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
      
      // Filter by search query
      const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.farmer.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return categoryMatch && searchMatch;
    });

    // Sort by distance if location is enabled
    if (isLocationEnabled && userLocation) {
      filtered = filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return filtered;
  }, [products, selectedCategory, searchQuery, isLocationEnabled, userLocation]);

  // Show loading state
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

  // Show error state
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

  // Use sample data if no products are loaded yet
  // This is a fallback in case there's no data in the database yet
  const displayProducts = products && products.length > 0 ? filteredProducts : sampleProducts.filter(product => {
    // Filter by category
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    
    // Filter by search query
    const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.farmer.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  return (
    <section className="py-8">
      <div className="container px-6 mx-auto">
        <MobileFilters />
        
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

// Sample product data (this is used as a fallback if no products in DB)
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
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfad?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
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
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
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
    image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
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
    image: 'https://images.unsplash.com/photo-1604323990536-92b4ba30b351?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
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
    image: 'https://images.unsplash.com/photo-1550406827-8c9689cd4025?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
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
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
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
    image: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
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
    image: 'https://images.unsplash.com/photo-1628053473552-f3bcc2595051?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    distance: 22,
    organic: true,
    native: false
  }
];

export default ProductGrid;
