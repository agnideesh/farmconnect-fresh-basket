import React, { useState } from 'react';
import { Info, Heart, Phone, Mail, MapPin, Navigation, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FarmerLocationMap from '../Map/FarmerLocationMap';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity?: number;
  farmer: {
    id: string;
    name: string;
    location: string;
    phone?: string;
    email?: string;
    avatar?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  image: string;
  distance?: number; // in km
  organic?: boolean;
  native?: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface ProductCardProps {
  product: Product;
  view?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, view = 'grid' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showFarmerDetails, setShowFarmerDetails] = useState(false);
  
  const defaultCoordinates = {
    latitude: 12.9716,
    longitude: 77.5946, // Bangalore coordinates as default
  };

  const productImage = product.image || "https://images.pexels.com/photos/2749165/pexels-photo-2749165.jpeg?auto=compress&cs=tinysrgb&w=800";
  const farmerAvatar = product.farmer.avatar || "https://images.pexels.com/photos/2382895/pexels-photo-2382895.jpeg?auto=compress&cs=tinysrgb&w=200";
  
  const productCoordinates = product.coordinates || product.farmer.coordinates || defaultCoordinates;
  
  if (view === 'list') {
    return (
      <>
        <div 
          className="group relative bg-white dark:bg-black/20 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex"
          onClick={() => setShowFarmerDetails(true)}
        >
          <div className="relative h-auto w-24 sm:w-36 aspect-square shrink-0">
            <img 
              src={productImage} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute top-1 left-1 flex flex-col gap-1">
              {product.organic && (
                <span className="bg-green-100 text-green-800 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                  Organic
                </span>
              )}
              {product.native && (
                <span className="bg-blue-100 text-blue-800 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                  Native
                </span>
              )}
            </div>
          </div>
          
          <div className="p-3 flex flex-col justify-between flex-1">
            <div>
              <span className="text-xs text-muted-foreground capitalize">{product.category}</span>
              <h3 className="font-medium">{product.name}</h3>
              
              <div className="flex items-center text-sm mt-1">
                <span className="font-medium">₹{product.price.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">/kg</span>
              </div>
              
              {product.quantity !== undefined && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Package className="w-3 h-3" />
                  <span>{product.quantity} kg available</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={farmerAvatar} />
                  <AvatarFallback>{product.farmer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{product.farmer.name}</span>
              </div>
              
              <div className="flex items-center gap-1 text-xs">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{product.distance !== undefined ? `${product.distance} km away` : 'Location unavailable'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              {product.farmer.phone && (
                <button 
                  className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `tel:${product.farmer.phone}`;
                  }}
                >
                  <Phone className="w-3 h-3 text-green-600" />
                </button>
              )}
              
              <button 
                className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFarmerDetails(true);
                }}
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
        
        <Dialog open={showFarmerDetails} onOpenChange={setShowFarmerDetails}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Farmer Details</DialogTitle>
              <DialogDescription>
                Contact information for {product.farmer.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={farmerAvatar} alt={product.farmer.name} />
                  <AvatarFallback>{product.farmer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{product.farmer.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.farmer.location}</p>
                </div>
              </div>
              
              <div className="grid gap-2">
                {product.farmer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    <a href={`tel:${product.farmer.phone}`} className="text-sm hover:underline">{product.farmer.phone}</a>
                  </div>
                )}
                
                {product.farmer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${product.farmer.email}`} className="text-sm hover:underline">{product.farmer.email}</a>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Farm Location
                </h4>
                <FarmerLocationMap 
                  location={productCoordinates}
                  farmerName={product.farmer.name}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{product.farmer.location}</span>
                  {product.distance !== undefined && (
                    <span className="text-xs flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      {product.distance} km away
                    </span>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">About this product</h4>
                <p className="text-sm">{product.name} - ₹{product.price.toFixed(2)}/kg</p>
                {product.quantity !== undefined && (
                  <p className="text-sm mt-1 flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    <span>{product.quantity} kg available</span>
                  </p>
                )}
                {product.organic && <span className="inline-block mr-2 mt-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">Organic</span>}
                {product.native && <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">Native</span>}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  
  return (
    <>
      <div 
        className="group relative bg-white dark:bg-black/20 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all-300 h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className="relative aspect-square overflow-hidden cursor-pointer"
          onClick={() => setShowFarmerDetails(true)}
        >
          <img 
            src={productImage} 
            alt={product.name}
            className={cn(
              "w-full h-full object-cover transition-transform duration-700",
              isHovered ? "scale-110" : "scale-100"
            )}
          />
          
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
          
          <div 
            className={cn(
              "absolute right-3 top-3 flex flex-col gap-2 transition-all duration-300",
              isHovered ? "opacity-100 transform translate-x-0" : "opacity-0 transform translate-x-10"
            )}
          >
            {product.farmer.phone && (
              <button 
                className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `tel:${product.farmer.phone}`;
                }}
              >
                <Phone className="w-4 h-4 text-green-600" />
              </button>
            )}
            
            <button 
              className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowFarmerDetails(true);
              }}
            >
              <Info className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
          <div className="mb-2">
            <span className="text-xs text-muted-foreground capitalize">{product.category}</span>
            <h3 className="font-medium">{product.name}</h3>
            
            {product.quantity !== undefined && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Package className="w-3 h-3" />
                <span>{product.quantity} kg available</span>
              </div>
            )}
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Farmer</span>
                <Link 
                  to={`/farmers/${product.farmer.id}`} 
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowFarmerDetails(true);
                  }}
                >
                  {product.farmer.name}
                </Link>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground">Distance</span>
                <span className="text-sm font-medium">{product.distance !== undefined ? `${product.distance} km` : 'N/A'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-end">
              <div className="text-lg font-semibold">₹{product.price.toFixed(2)}<span className="text-xs text-muted-foreground">/kg</span></div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showFarmerDetails} onOpenChange={setShowFarmerDetails}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Farmer Details</DialogTitle>
            <DialogDescription>
              Contact information for {product.farmer.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4 py-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={farmerAvatar} alt={product.farmer.name} />
                <AvatarFallback>{product.farmer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{product.farmer.name}</h3>
                <p className="text-sm text-muted-foreground">{product.farmer.location}</p>
              </div>
            </div>
            
            <div className="grid gap-2">
              {product.farmer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  <a href={`tel:${product.farmer.phone}`} className="text-sm hover:underline">{product.farmer.phone}</a>
                </div>
              )}
              
              {product.farmer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${product.farmer.email}`} className="text-sm hover:underline">{product.farmer.email}</a>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Farm Location
              </h4>
              <FarmerLocationMap 
                location={productCoordinates}
                farmerName={product.farmer.name}
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">{product.farmer.location}</span>
                {product.distance !== undefined && (
                  <span className="text-xs flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    {product.distance} km away
                  </span>
                )}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">About this product</h4>
              <p className="text-sm">{product.name} - ₹{product.price.toFixed(2)}/kg</p>
              {product.quantity !== undefined && (
                <p className="text-sm mt-1 flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  <span>{product.quantity} kg available</span>
                </p>
              )}
              {product.organic && <span className="inline-block mr-2 mt-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">Organic</span>}
              {product.native && <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">Native</span>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;
