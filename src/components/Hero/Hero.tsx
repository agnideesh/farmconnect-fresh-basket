
import React from 'react';
import AnimatedButton from '../UI/AnimatedButton';
import FadeInSection from '../UI/FadeInSection';
import { Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-28 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute right-0 top-1/3 w-1/3 h-1/2 bg-primary/5 rounded-l-full -z-10"></div>
      <div className="absolute left-0 bottom-1/4 w-1/4 h-1/3 bg-secondary rounded-r-full -z-10"></div>
      
      <div className="container px-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeInSection className="max-w-2xl" direction="right">
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
              Farm to Table, Simplified
            </span>
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold tracking-tight mb-6 text-balance">
              Fresh Farm Products <br />
              <span className="text-primary">Directly to Your Door</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Discover local farm produce, support farmers directly, and enjoy 
              native and fresh ingredients with full transparency from farm to table.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <AnimatedButton 
                size="lg" 
                icon={<Search className="w-5 h-5" />}
                iconPosition="left"
              >
                Explore Products
              </AnimatedButton>
              <AnimatedButton 
                size="lg" 
                variant="outline"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
              >
                Meet Our Farmers
              </AnimatedButton>
            </div>
            
            <div className="mt-10 grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">150+</div>
                <div className="text-muted-foreground text-sm">Local Farmers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">1000+</div>
                <div className="text-muted-foreground text-sm">Native Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">200km</div>
                <div className="text-muted-foreground text-sm">Delivery Range</div>
              </div>
            </div>
          </FadeInSection>
          
          <FadeInSection className="w-full" delay={300}>
            <div className="relative">
              <div className="aspect-square w-full max-w-lg mx-auto overflow-hidden rounded-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1595855759920-87483ef743ec?q=80&w=800&auto=format&fit=crop"
                  alt="Fresh farm produce" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Decorative elements overlaid on the image */}
              <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-2xl overflow-hidden rotate-6 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=400&auto=format&fit=crop"
                  alt="Farmer with produce" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-2xl overflow-hidden -rotate-12 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1603169429624-da7c0513ae98?q=80&w=400&auto=format&fit=crop"
                  alt="Fresh vegetables" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Glass card with feature point */}
              <div className="absolute bottom-8 right-8 glass-card rounded-xl p-4 shadow-lg max-w-[200px]">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-4 h-4 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Real-time updates</h4>
                    <p className="text-xs text-muted-foreground mt-1">Get notified about nearby farm sales and fresh harvests</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

export default Hero;
