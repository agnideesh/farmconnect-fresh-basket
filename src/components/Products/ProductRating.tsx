
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';

interface ProductRatingProps {
  productId: string;
}

export const ProductRating = ({ productId }: ProductRatingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: ratingData, refetch: refetchRating } = useQuery({
    queryKey: ['productRating', productId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_product_rating', {
        p_product_id: productId
      });
      if (error) throw error;
      return data[0];
    }
  });

  const { data: userRating, refetch: refetchUserRating } = useQuery({
    queryKey: ['userRating', productId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('product_ratings')
        .select('rating')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ['productComments', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_comments')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const handleRating = async (value: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to rate products",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('set_product_rating', {
        p_product_id: productId,
        p_rating: value,
        p_user_id: user.id
      });

      if (error) throw error;

      setRating(value);
      refetchRating();
      refetchUserRating();
      
      toast({
        title: "Rating updated",
        description: "Thank you for your feedback!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update rating",
        variant: "destructive",
      });
    }
  };

  const handleComment = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('product_comments')
        .insert({
          product_id: productId,
          user_id: user.id,
          comment: comment.trim()
        });

      if (error) throw error;

      setComment('');
      refetchComments();
      
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Product Rating</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 cursor-pointer transition-colors ${
                  (hoveredStar || userRating?.rating || 0) >= star
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => handleRating(star)}
              />
            ))}
          </div>
          {ratingData && (
            <span className="text-sm text-muted-foreground">
              {ratingData.average_rating} ({ratingData.total_ratings} {ratingData.total_ratings === 1 ? 'rating' : 'ratings'})
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Comments</h3>
        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px]"
          />
          <Button 
            onClick={handleComment}
            disabled={isSubmitting || !comment.trim()}
            className="self-end"
          >
            Post Comment
          </Button>
        </div>

        <div className="space-y-4 mt-4">
          {comments?.map((comment) => (
            <div key={comment.id} className="border-b pb-4">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {(comment.profiles as any)?.full_name || 'Anonymous'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                  <p className="mt-2">{comment.comment}</p>
                </div>
              </div>
            </div>
          ))}
          {!comments?.length && (
            <p className="text-sm text-muted-foreground">No comments yet</p>
          )}
        </div>
      </div>
    </div>
  );
};
