import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/components/Products/ProductCard';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExtendedProduct extends Product {
  description?: string;
}

interface RawProductData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  farmer_id: string | null;
  image_url: string | null;
  created_at: string;
  quantity?: number;
  latitude?: number;
  longitude?: number;
}

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

const FarmerDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    description: '',
    price: 0,
    category: 'vegetables',
    quantity: 0,
    image: '',
    latitude: null as number | null,
    longitude: null as number | null
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [locationState, setLocationState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    loading: false,
    error: null
  });

  useEffect(() => {
    if (!user) return;

    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('farmer_id', user.id);

        if (error) throw error;

        const productsWithFarmer = data.map((product: RawProductData) => ({
          ...product,
          quantity: product.quantity || 0,
          description: product.description || '',
          coordinates: product.latitude && product.longitude 
            ? { latitude: product.latitude, longitude: product.longitude } 
            : undefined,
          farmer: {
            id: user.id,
            name: profile?.full_name || 'Unknown Farmer',
            location: profile?.location || 'Unknown Location',
            phone: profile?.phone_number,
            email: profile?.email,
            avatar: profile?.avatar_url,
            coordinates: profile?.latitude && profile?.longitude
              ? {
                  latitude: profile.latitude,
                  longitude: profile.longitude
                }
              : undefined
          },
          image: product.image_url || '/placeholder.svg'
        }));

        setProducts(productsWithFarmer);
      } catch (error: any) {
        console.error('Error fetching products:', error.message);
        toast({
          title: 'Error',
          description: 'Failed to load products. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [user, profile, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
    }
  };

  const getProductLocation = () => {
    if (locationState.latitude && locationState.longitude) {
      setProductForm(prev => ({
        ...prev,
        latitude: locationState.latitude,
        longitude: locationState.longitude
      }));
      return;
    }

    setLocationState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        setLocationState({
          latitude,
          longitude,
          loading: false,
          error: null
        });
        
        setProductForm(prev => ({
          ...prev,
          latitude,
          longitude
        }));
        
        toast({
          title: 'Location detected',
          description: 'Your current location has been added to this product.',
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        
        let errorMessage = 'Could not access your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        setLocationState({
          latitude: null,
          longitude: null,
          loading: false,
          error: errorMessage
        });
        
        toast({
          title: 'Location error',
          description: errorMessage,
          variant: 'destructive',
        });
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleAddProduct = () => {
    setIsEditMode(false);
    setProductForm({
      id: '',
      name: '',
      description: '',
      price: 0,
      category: 'vegetables',
      quantity: 0,
      image: '',
      latitude: null,
      longitude: null
    });
    setSelectedImage(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: ExtendedProduct) => {
    setIsEditMode(true);
    setProductForm({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      quantity: product.quantity || 0,
      image: product.image,
      latitude: product.coordinates?.latitude || null,
      longitude: product.coordinates?.longitude || null
    });
    setSelectedImage(null);
    setIsDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCategoryChange = (value: string) => {
    setProductForm(prev => ({
      ...prev,
      category: value
    }));
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${user!.id}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      let imageUrl = isEditMode ? productForm.image : null;

      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: productForm.price,
        category: productForm.category,
        quantity: productForm.quantity,
        ...(productForm.latitude && productForm.longitude ? { 
          latitude: productForm.latitude,
          longitude: productForm.longitude 
        } : {}),
        ...(imageUrl ? { image_url: imageUrl } : {})
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productForm.id);

        if (error) throw error;

        setProducts(prev =>
          prev.map(p =>
            p.id === productForm.id
              ? {
                  ...p,
                  name: productForm.name,
                  description: productForm.description,
                  price: productForm.price,
                  category: productForm.category,
                  quantity: productForm.quantity,
                  coordinates: productForm.latitude && productForm.longitude 
                    ? { latitude: productForm.latitude, longitude: productForm.longitude } 
                    : p.coordinates,
                  image: imageUrl || p.image
                }
              : p
          )
        );

        toast({
          title: 'Success',
          description: 'Product updated successfully',
        });
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert({
            ...productData,
            farmer_id: user.id,
          })
          .select('*')
          .single();

        if (error) throw error;

        setProducts(prev => [
          ...prev,
          {
            ...data as RawProductData,
            quantity: (data as any).quantity || 0,
            description: (data as any).description || '',
            coordinates: (data as any).latitude && (data as any).longitude 
              ? { latitude: (data as any).latitude, longitude: (data as any).longitude } 
              : undefined,
            farmer: {
              id: user.id,
              name: profile?.full_name || 'Unknown Farmer',
              location: profile?.location || 'Unknown Location',
              phone: profile?.phone_number,
              email: profile?.email,
              avatar: profile?.avatar_url,
              coordinates: profile?.latitude && profile?.longitude
                ? {
                    latitude: profile.latitude,
                    longitude: profile.longitude
                  }
                : undefined
            },
            image: (data as any).image_url || '/placeholder.svg'
          }
        ]);

        toast({
          title: 'Success',
          description: 'Product added successfully',
        });
      }

      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error submitting product:', error.message);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== productId));

      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting product:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Farmer Dashboard</h1>
          <Button onClick={handleAddProduct} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">No Products Yet</h2>
            <p className="text-muted-foreground mb-4">Add your first product to start selling!</p>
            <Button onClick={handleAddProduct} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-card rounded-lg shadow-sm overflow-hidden border">
                <div className="aspect-video relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {product.description?.substring(0, 100)}
                    {product.description && product.description.length > 100 ? '...' : ''}
                  </p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-muted-foreground text-sm">Price:</span>
                      <span className="ml-1 font-medium">₹{product.price.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">Quantity:</span>
                      <span className="ml-1 font-medium">{product.quantity} kg</span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditProduct(product)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update your product details below'
                : 'Fill in the details to add a new product'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={productForm.name}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={productForm.description}
                onChange={handleFormChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹/kg)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.price || ''}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (kg)</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="0.1"
                  value={productForm.quantity || ''}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={productForm.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="herbs">Herbs</SelectItem>
                  <SelectItem value="flowers">Flowers</SelectItem>
                  <SelectItem value="byproducts">Byproducts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="location">Product Location</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={getProductLocation}
                  disabled={locationState.loading}
                  className="flex items-center gap-1"
                >
                  {locationState.loading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-3 w-3" />
                      {productForm.latitude && productForm.longitude 
                        ? 'Update Location' 
                        : 'Get Current Location'}
                    </>
                  )}
                </Button>
              </div>
              
              {locationState.error && (
                <Alert variant="destructive" className="mt-2 py-2">
                  <AlertDescription>{locationState.error}</AlertDescription>
                </Alert>
              )}
              
              {productForm.latitude && productForm.longitude && (
                <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                  <div className="flex justify-between">
                    <span>Latitude: {productForm.latitude.toFixed(6)}</span>
                    <span>Longitude: {productForm.longitude.toFixed(6)}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Location data will help customers find your products based on their proximity.
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  Choose Image
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedImage ? selectedImage.name : isEditMode ? 'Current image' : 'No image selected'}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEditMode ? (
                  'Update Product'
                ) : (
                  'Add Product'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default FarmerDashboard;
