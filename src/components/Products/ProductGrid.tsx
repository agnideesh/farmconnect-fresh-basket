
import React, { useState } from 'react';
import ProductCard, { Product } from './ProductCard';
import { Search } from 'lucide-react';
import FadeInSection from '../UI/FadeInSection';

// Sample product data (this would be fetched from an API in a real app)
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Tomatoes',
    category: 'vegetables',
    price: 80,
    farmer: {
      id: '101',
      name: 'Anand Farms',
      location: 'Bangalore Rural'
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
      location: 'Shimla'
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
      location: 'Kochi'
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
      location: 'Coimbatore'
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
      location: 'Trivandrum'
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
      location: 'Bangalore Rural'
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
      location: 'Ratnagiri'
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
      location: 'Kochi'
    },
    image: 'https://images.unsplash.com/photo-1628053473552-f3bcc2595051?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    distance: 22,
    organic: true,
    native: false
  }
];

interface ProductGridProps {
  selectedCategory: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ selectedCategory }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter products based on category and search query
  const filteredProducts = sampleProducts.filter(product => {
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
            <span className="text-sm font-normal text-muted-foreground ml-2">({filteredProducts.length} products)</span>
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
        
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
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

export default ProductGrid;
