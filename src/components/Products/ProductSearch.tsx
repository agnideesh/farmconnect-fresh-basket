
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ProductSearchProps {
  onSearch: (term: string) => void;
  placeholder?: string;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ 
  onSearch, 
  placeholder = "Search products..." 
}) => {
  return (
    <div className="relative max-w-md w-full mx-auto">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
        <Search className="w-4 h-4" />
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-9 w-full"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};

export default ProductSearch;
