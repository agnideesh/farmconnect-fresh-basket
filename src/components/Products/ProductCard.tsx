
import React, { useState } from 'react';
import { Info, ShoppingCart, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  farmer: {
    id: string;
    name: string;
    location: string;
  };
  image: string;
  distance?: number; // in km
  organic?: boolean;
  native?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="group relative bg-white dark:bg-black/20 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all-300 h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product image */}
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className={cn(
            "w-full h-full object-cover transition-transform duration-700",
            isHovered ? "scale-110" : "scale-100"
          )}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.organic && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
              Organic
            </span>
          )}
          {product.native && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
              Native
            </span>
          )}
        </div>
        
        {/* Quick action buttons */}
        <div 
          className={cn(
            "absolute right-3 top-3 flex flex-col gap-2 transition-all duration-300",
            isHovered ? "opacity-100 transform translate-x-0" : "opacity-0 transform translate-x-10"
          )}
        >
          <button className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
            <Heart className="w-4 h-4 text-foreground" />
          </button>
          <button className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
            <Info className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>
      
      {/* Product info */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="text-xs text-muted-foreground capitalize">{product.category}</span>
          <h3 className="font-medium">{product.name}</h3>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Farmer</span>
              <Link to={`/farmers/${product.farmer.id}`} className="text-sm font-medium hover:text-primary transition-colors">
                {product.farmer.name}
              </Link>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground">Distance</span>
              <span className="text-sm">{product.distance || 0} km</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">₹{product.price.toFixed(2)}<span className="text-xs text-muted-foreground">/kg</span></div>
            <button className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg transition-colors">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm">Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
