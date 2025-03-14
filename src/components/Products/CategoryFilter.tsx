
import React from 'react';
import { cn } from '@/lib/utils';
import { Leaf, Apple, Flower2, Coffee, Package } from 'lucide-react';
import FadeInSection from '../UI/FadeInSection';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const categories: Category[] = [
    { id: 'all', name: 'All Products', icon: <Package className="w-5 h-5" /> },
    { id: 'vegetables', name: 'Vegetables', icon: <Leaf className="w-5 h-5" /> },
    { id: 'fruits', name: 'Fruits', icon: <Apple className="w-5 h-5" /> },
    { id: 'herbs', name: 'Herbs', icon: <Leaf className="w-5 h-5 rotate-45" /> },
    { id: 'flowers', name: 'Flowers', icon: <Flower2 className="w-5 h-5" /> },
    { id: 'byproducts', name: 'Byproducts', icon: <Coffee className="w-5 h-5" /> },
  ];

  return (
    <FadeInSection className="w-full py-8">
      <div className="container px-6 mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Browse Categories</h2>
        
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all-200 font-medium text-sm md:text-base",
                selectedCategory === category.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-secondary/50 hover:bg-secondary text-foreground/80 hover:text-foreground"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {category.icon}
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </FadeInSection>
  );
};

export default CategoryFilter;
