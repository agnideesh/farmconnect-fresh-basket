
import React, { useState, useRef } from 'react';
import Navbar from '@/components/Layout/Navbar';
import Hero from '@/components/Hero/Hero';
import CategoryFilter from '@/components/Products/CategoryFilter';
import ProductGrid from '@/components/Products/ProductGrid';
import ProductSearch from '@/components/Products/ProductSearch';
import Footer from '@/components/Layout/Footer';
import FadeInSection from '@/components/UI/FadeInSection';
import { ArrowDown } from 'lucide-react';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const productsRef = useRef<HTMLDivElement>(null);

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Hero />
        
        <FadeInSection className="text-center py-10" delay={600}>
          <button 
            className="animate-float inline-flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors"
            onClick={scrollToProducts}
          >
            <span className="text-sm font-medium mb-2">Discover Products</span>
            <ArrowDown className="w-5 h-5" />
          </button>
        </FadeInSection>
        
        <div id="products" ref={productsRef}>
          <div className="container mx-auto px-6 space-y-8">
            <ProductSearch onSearch={handleSearch} />
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
          
          <ProductGrid 
            selectedCategory={selectedCategory}
            searchTerm={searchTerm}
          />
        </div>

        <FadeInSection className="py-16 bg-primary/5">
          <div className="container px-6 mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose FarmConnect?</h2>
              <p className="text-muted-foreground mb-12">
                We're on a mission to make native farm products more accessible while supporting local farmers.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <div className="w-6 h-6 bg-primary rounded-md"></div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Farm to Table</h3>
                  <p className="text-muted-foreground text-sm">
                    Direct sourcing ensures the freshest products reach your home within hours of harvest.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <div className="w-6 h-6 bg-primary rounded-md"></div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Support Local Farmers</h3>
                  <p className="text-muted-foreground text-sm">
                    Farmers earn more when you buy directly, supporting sustainable farming practices.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <div className="w-6 h-6 bg-primary rounded-md"></div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Native Products</h3>
                  <p className="text-muted-foreground text-sm">
                    Discover indigenous varieties grown using traditional farming methods.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
