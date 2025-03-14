
import React from 'react';
import { Grid } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  farmer: {
    id: string;
    name: string;
    location: string;
    phone_number: string;
  };
}

export interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Grid className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No products found</h3>
        <p className="mt-2 text-muted-foreground">
          Try changing your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-card rounded-lg shadow overflow-hidden border border-border hover:shadow-md transition-shadow">
          <div className="h-48 overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-lg">{product.name}</h3>
              <span className="font-bold text-primary">₹{product.price}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{product.farmer.name}</span>
              <button className="bg-primary text-white px-4 py-1 rounded-full text-sm hover:bg-primary/90 transition-colors">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
