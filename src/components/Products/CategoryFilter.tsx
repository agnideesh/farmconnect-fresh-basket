
import React from 'react';
import { cn } from '@/lib/utils';
import { Leaf, Apple, Flower2, Coffee, Package } from 'lucide-react';
import FadeInSection from '../UI/FadeInSection';

export interface Category {
  id: string;
  name: string;
}

export interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onChange,
}) => {
  const getIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'vegetables':
        return <Leaf className="w-5 h-5" />;
      case 'fruits':
        return <Apple className="w-5 h-5" />;
      case 'herbs':
        return <Leaf className="w-5 h-5 rotate-45" />;
      case 'flowers':
        return <Flower2 className="w-5 h-5" />;
      case 'spices':
      case 'grains':
        return <Coffee className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  return (
    <FadeInSection className="w-full py-8">
      <div className="container px-6 mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Browse Categories</h2>
        
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => onChange(category.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all-200 font-medium text-sm md:text-base",
                activeCategory === category.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-secondary/50 hover:bg-secondary text-foreground/80 hover:text-foreground"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {getIcon(category.id)}
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </FadeInSection>
  );
};

export default CategoryFilter;
