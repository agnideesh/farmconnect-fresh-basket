
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Tractor, Phone, UserPlus, UserMinus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface FarmerData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  specialties: string[] | null;
  email: string | null;
  phone_number: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface FarmerCardProps {
  farmer: FarmerData;
  isFollowed?: boolean;
  onFollowChange?: (farmerId: string, isFollowed: boolean) => void;
}

const defaultImage = "https://images.pexels.com/photos/4207783/pexels-photo-4207783.jpeg?auto=compress&cs=tinysrgb&w=800";

const FarmerCard: React.FC<FarmerCardProps> = ({ farmer, isFollowed = false, onFollowChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [following, setFollowing] = useState(isFollowed);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow farmers",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (following) {
        // Unfollow the farmer
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('user_id', user.id)
          .eq('farmer_id', farmer.id);
          
        if (error) throw error;
        
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${farmer.full_name}`,
        });
      } else {
        // Follow the farmer
        const { error } = await supabase
          .from('follows')
          .insert({
            user_id: user.id,
            farmer_id: farmer.id,
          });
          
        if (error) throw error;
        
        toast({
          title: "Following",
          description: `You are now following ${farmer.full_name}`,
        });
      }
      
      // Toggle the following state
      setFollowing(!following);
      
      // Notify parent component if callback provided
      if (onFollowChange) {
        onFollowChange(farmer.id, !following);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Link to={`/farmers/${farmer.id}`}>
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        <div className="relative h-48 bg-gradient-to-r from-primary/10 to-primary/20 flex items-center justify-center">
          {farmer.avatar_url ? (
            <img 
              src={farmer.avatar_url} 
              alt={farmer.full_name || 'Farmer'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src={defaultImage} 
              alt={farmer.full_name || 'Farmer'} 
              className="w-full h-full object-cover"
            />
          )}
          
          {user && (
            <Button
              variant="outline"
              size="sm"
              className={`absolute top-3 right-3 bg-background/80 backdrop-blur-sm ${following ? 'border-green-500 text-green-600' : ''}`}
              onClick={handleFollow}
              disabled={isLoading}
            >
              {following ? (
                <>
                  <UserMinus className="mr-1 h-4 w-4" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="mr-1 h-4 w-4" />
                  Follow
                </>
              )}
            </Button>
          )}
        </div>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10 border-2 border-primary/10">
              <AvatarImage src={farmer.avatar_url || defaultImage} />
              <AvatarFallback>{farmer.full_name?.charAt(0) || 'F'}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-lg line-clamp-1">{farmer.full_name || 'Unknown Farmer'}</h3>
              {farmer.location && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{farmer.location}</span>
                </div>
              )}
            </div>
          </div>
          
          {farmer.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{farmer.bio}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mb-3">
            {farmer.specialties && farmer.specialties.length > 0 && farmer.specialties.map((specialty, index) => (
              <span 
                key={index} 
                className="bg-primary/10 text-primary/80 text-xs px-2 py-1 rounded-full"
              >
                {specialty}
              </span>
            ))}
          </div>
          
          {farmer.phone_number && (
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <Phone className="h-3 w-3 mr-1 text-green-600" />
              <span>{farmer.phone_number}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default FarmerCard;
