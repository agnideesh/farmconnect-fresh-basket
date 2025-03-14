
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Loader2, X, User } from 'lucide-react';

interface ProfileImageUploadProps {
  userId: string;
  existingUrl: string | null;
  onUploadComplete: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  userId,
  existingUrl,
  onUploadComplete,
  size = 'md',
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl);
  
  const avatarSizeClass = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }[size];
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Create a file path using user id to organize storage
      const filePath = `${userId}/${Date.now()}-${file.name}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(data.path);
      
      // Set preview and call the callback
      setPreviewUrl(publicUrl);
      onUploadComplete(publicUrl);
      
      toast({
        title: "Image uploaded",
        description: "Your profile image has been updated",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveImage = async () => {
    if (!previewUrl || !existingUrl) return;
    
    try {
      setIsUploading(true);
      
      // Extract the path from the URL (everything after the bucket name)
      const urlParts = existingUrl.split('profile-images/');
      if (urlParts.length < 2) throw new Error("Invalid image URL");
      
      const filePath = urlParts[1];
      
      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from('profile-images')
        .remove([filePath]);
      
      if (error) throw error;
      
      // Clear preview and call the callback with empty string
      setPreviewUrl(null);
      onUploadComplete('');
      
      toast({
        title: "Image removed",
        description: "Your profile image has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Error removing image",
        description: error.message || "There was an error removing your image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4">
        <Avatar className={`${avatarSizeClass} border-4 border-primary/10`}>
          <AvatarImage src={previewUrl || undefined} />
          <AvatarFallback>
            <User className="w-1/2 h-1/2" />
          </AvatarFallback>
        </Avatar>
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
            <Loader2 className="w-1/3 h-1/3 animate-spin text-primary" />
          </div>
        )}
        
        {previewUrl && (
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-7 w-7 rounded-full"
            onClick={handleRemoveImage}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="relative overflow-hidden"
          disabled={isUploading}
        >
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Upload className="mr-2 h-4 w-4" />
          {previewUrl ? 'Change Image' : 'Upload Image'}
        </Button>
      </div>
    </div>
  );
};

export default ProfileImageUpload;
