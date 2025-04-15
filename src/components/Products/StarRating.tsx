
import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StarRatingProps {
  productId: string;
  initialRating?: number;
  averageRating?: number;
  totalRatings?: number;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  productId,
  initialRating = 0,
  averageRating,
  totalRatings,
  readonly = false,
  size = 'md',
  onRatingChange
}) => {
  const [rating, setRating] = React.useState(initialRating);
  const [hoveredRating, setHoveredRating] = React.useState(0);
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleRatingClick = async (selectedRating: number) => {
    if (readonly) return;

    try {
      const { error } = await supabase
        .from('product_ratings')
        .upsert({
          product_id: productId,
          rating: selectedRating,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      setRating(selectedRating);
      if (onRatingChange) onRatingChange(selectedRating);

      toast({
        title: "Rating updated",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      console.error('Error updating rating:', error);
      toast({
        title: "Error",
        description: "Please sign in to rate products",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            className={cn(
              "transition-colors",
              !readonly && "hover:scale-110 cursor-pointer"
            )}
            onMouseEnter={() => !readonly && setHoveredRating(star)}
            onMouseLeave={() => !readonly && setHoveredRating(0)}
            onClick={() => handleRatingClick(star)}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors",
                (hoveredRating ? star <= hoveredRating : star <= rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : averageRating && star <= averageRating
                  ? "fill-yellow-400/80 text-yellow-400/80"
                  : "fill-muted text-muted-foreground"
              )}
            />
          </button>
        ))}
        {averageRating && totalRatings && (
          <span className="text-sm text-muted-foreground ml-2">
            ({averageRating.toFixed(1)} • {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
          </span>
        )}
      </div>
    </div>
  );
};

export default StarRating;
