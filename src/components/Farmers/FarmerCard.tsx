
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Tractor, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
}

const FarmerCard: React.FC<FarmerCardProps> = ({ farmer }) => {
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
            <Tractor size={48} className="text-primary/40" />
          )}
        </div>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10 border-2 border-primary/10">
              <AvatarImage src={farmer.avatar_url || undefined} />
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
