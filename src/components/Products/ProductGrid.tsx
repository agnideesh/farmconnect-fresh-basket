
import React, { useState } from 'react';
import ProductCard, { Product } from './ProductCard';
import { Search } from 'lucide-react';
import FadeInSection from '../UI/FadeInSection';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProductGridProps {
  selectedCategory: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ selectedCategory }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch products from Supabase
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products_with_farmer_details')
        .select('*');
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        farmer: {
          id: item.farmer_id,
          name: item.farmer_name || 'Unknown Farmer',
          location: 'Local Farm',
          phone: item.farmer_phone,
          email: item.farmer_email,
          avatar: item.farmer_avatar
        },
        image: item.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfad?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        organic: Math.random() > 0.5, // Placeholder, you can add this field to your DB
        native: Math.random() > 0.5,  // Placeholder, you can add this field to your DB
        distance: Math.floor(Math.random() * 50) + 1 // Placeholder distance, can be calculated based on user location
      }));
    }
  });
  
  // Filter products based on category and search query
  const filteredProducts = (products || []).filter(product => {
    // Filter by category
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    
    // Filter by search query
    const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.farmer.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold">
            {selectedCategory === 'all' ? 'Featured Products' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
            <span className="text-sm font-normal text-muted-foreground ml-2">({displayProducts.length} products)</span>
          </h2>
          
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
        
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map((product, index) => (
              <FadeInSection key={product.id} delay={index * 100} className="h-full">
                <ProductCard product={product} />
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
      email: 'anand@farms.com'
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
      email: 'info@himachalgrowers.com'
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
      email: 'contact@keralaherbs.com'
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
      email: 'sales@tamilblooms.com'
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
      email: 'orders@keralacoco.com'
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
      email: 'anand@farms.com'
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
      email: 'mangoes@ratnagirifruits.com'
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
      email: 'contact@keralaherbs.com'
    },
    image: 'https://images.unsplash.com/photo-1628053473552-f3bcc2595051?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    distance: 22,
    organic: true,
    native: false
  }
];

export default ProductGrid;
