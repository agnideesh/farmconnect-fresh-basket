
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import ProductGrid from '@/components/Products/ProductGrid';
import CategoryFilter from '@/components/Products/CategoryFilter';

// Mock product data
const productsMockData = [
  {
    id: '1',
    name: 'Organic Tomatoes',
    price: 40,
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8dG9tYXRvZXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    category: 'vegetables',
    description: 'Fresh organic tomatoes grown without pesticides.',
    farmer: {
      id: '44e19264-b00c-44fb-b922-f29e68021331',
      name: 'John Smith',
      location: 'Karnataka, India',
      phone_number: '+91 98765 43210'
    }
  },
  {
    id: '2',
    name: 'Basmati Rice',
    price: 120,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cmljZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    category: 'grains',
    description: 'Premium quality aged basmati rice.',
    farmer: {
      id: '5e7f3a2b-8c9d-4e5f-a6b7-1c2d3e4f5a6b',
      name: 'Priya Sharma',
      location: 'Tamil Nadu, India',
      phone_number: '+91 87654 32109'
    }
  },
  {
    id: '3',
    name: 'Fresh Spinach',
    price: 30,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3BpbmFjaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    category: 'vegetables',
    description: 'Locally grown fresh spinach leaves.',
    farmer: {
      id: '44e19264-b00c-44fb-b922-f29e68021331',
      name: 'John Smith',
      location: 'Karnataka, India',
      phone_number: '+91 98765 43210'
    }
  },
  {
    id: '4',
    name: 'Alphonso Mangoes',
    price: 450,
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFuZ298ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    category: 'fruits',
    description: 'Sweet and juicy Alphonso mangoes in season.',
    farmer: {
      id: '7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p',
      name: 'Raj Patel',
      location: 'Gujarat, India',
      phone_number: '+91 76543 21098'
    }
  },
  {
    id: '5',
    name: 'Organic Potatoes',
    price: 60,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cG90YXRvZXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    category: 'vegetables',
    description: 'Farm-fresh organic potatoes.',
    farmer: {
      id: '7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p',
      name: 'Raj Patel',
      location: 'Gujarat, India',
      phone_number: '+91 76543 21098'
    }
  },
  {
    id: '6',
    name: 'Turmeric Powder',
    price: 90,
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHVybWVyaWN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    category: 'spices',
    description: 'Freshly ground organic turmeric powder.',
    farmer: {
      id: '5e7f3a2b-8c9d-4e5f-a6b7-1c2d3e4f5a6b',
      name: 'Priya Sharma',
      location: 'Tamil Nadu, India',
      phone_number: '+91 87654 32109'
    }
  }
];

const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'vegetables', name: 'Vegetables' },
  { id: 'fruits', name: 'Fruits' },
  { id: 'grains', name: 'Grains' },
  { id: 'spices', name: 'Spices' },
];

const Products: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const filteredProducts = activeCategory === 'all' 
    ? productsMockData 
    : productsMockData.filter(product => product.category === activeCategory);
  
  return (
    <>
      <Helmet>
        <title>Farm Products | FarmConnect</title>
      </Helmet>
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Fresh Farm Products</h1>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover fresh, locally grown products directly from farmers. All items are harvested 
          at peak ripeness for the best flavor and nutritional value.
        </p>
        
        <CategoryFilter 
          categories={categories} 
          activeCategory={activeCategory} 
          onChange={setActiveCategory} 
        />
        
        <ProductGrid products={filteredProducts} />
      </main>
      <Footer />
    </>
  );
};

export default Products;
