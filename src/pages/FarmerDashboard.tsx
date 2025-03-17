
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
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

// Extend the Product interface from ProductCard to include description
interface ExtendedProduct extends Product {
  description?: string;
}

// Define a type for the raw product data from Supabase
interface RawProductData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  farmer_id: string | null;
  image_url: string | null;
  created_at: string;
  quantity?: number; // Make it optional since it might not be in older records
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    description: '',
    price: 0,
    category: 'vegetables',
    quantity: 0
  });

  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch farmer's products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('farmer_id', user.id);

        if (error) throw error;

        // Map the Supabase products to include the farmer data and ensure quantity is present
        const productsWithFarmer = data.map((product: RawProductData) => ({
          ...product,
          quantity: product.quantity || 0, // Use existing quantity or default to 0
          description: product.description || '', // Add description field
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

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Open dialog for new product
  const handleAddProduct = () => {
    setIsEditMode(false);
    setProductForm({
      id: '',
      name: '',
      description: '',
      price: 0,
      category: 'vegetables',
      quantity: 0
    });
    setSelectedImage(null);
    setImagePreview(null);
    setIsDialogOpen(true);
  };

  // Open dialog for editing product
  const handleEditProduct = (product: ExtendedProduct) => {
    setIsEditMode(true);
    setProductForm({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      quantity: product.quantity || 0
    });
    setImagePreview(product.image);
    setSelectedImage(null);
    setIsDialogOpen(true);
  };

  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? parseFloat(value) || 0 : value
    }));
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setProductForm(prev => ({
      ...prev,
      category: value
    }));
  };

  // Upload image to storage
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      let imageUrl = imagePreview;

      // Upload image if selected
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      if (isEditMode) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: productForm.name,
            description: productForm.description,
            price: productForm.price,
            category: productForm.category,
            quantity: productForm.quantity,
            ...(imageUrl && imageUrl !== imagePreview ? { image_url: imageUrl } : {})
          })
          .eq('id', productForm.id);

        if (error) throw error;

        // Update local state
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
        // Insert new product
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: productForm.name,
            description: productForm.description,
            price: productForm.price,
            category: productForm.category,
            quantity: productForm.quantity,
            farmer_id: user.id,
            image_url: imageUrl
          })
          .select('*')
          .single();

        if (error) throw error;

        // Add to local state
        setProducts(prev => [
          ...prev,
          {
            ...data as RawProductData, // Cast to our RawProductData type
            quantity: (data as any).quantity || 0,
            description: (data as any).description || '',
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

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      // Remove from local state
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
                  {selectedImage ? selectedImage.name : imagePreview ? 'Current image' : 'No image selected'}
                </span>
              </div>
              {(imagePreview || selectedImage) && (
                <div className="mt-2 border rounded-md overflow-hidden w-full h-40">
                  <img
                    src={imagePreview || ''}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
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
