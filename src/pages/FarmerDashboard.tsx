
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import AnimatedButton from '@/components/UI/AnimatedButton';
import { Package, PlusCircle, Edit, Trash, LogOut, X, Upload } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  image_url: string;
}

const FarmerDashboard = () => {
  const { signOut, profile, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('vegetables');
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('farmer_id', user.id);

      if (error) throw error;
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setQuantity('');
    setCategory('vegetables');
    setImage(null);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setUploading(true);
      
      let imageUrl = '';
      
      // Upload image if selected
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, image);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
          
        imageUrl = data.publicUrl;
      }
      
      // Insert product
      const { error } = await supabase
        .from('products')
        .insert({
          farmer_id: user.id,
          name,
          description,
          price: parseFloat(price),
          quantity: parseInt(quantity) || 0,
          category,
          image_url: imageUrl
        });
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Product added successfully",
      });
      
      resetForm();
      setShowAddModal(false);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setProducts(products.filter(product => product.id !== id));
      
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Farmer Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {profile?.full_name || 'Farmer'}</p>
            </div>
            
            <div className="flex gap-3">
              <AnimatedButton 
                onClick={() => setShowAddModal(true)}
                icon={<PlusCircle className="w-5 h-5" />}
                iconPosition="left"
              >
                Add Product
              </AnimatedButton>
              
              <AnimatedButton 
                variant="outline" 
                onClick={handleSignOut}
                icon={<LogOut className="w-5 h-5" />}
                iconPosition="left"
              >
                Sign Out
              </AnimatedButton>
            </div>
          </div>
          
          <div className="bg-white shadow-sm rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Your Products</h2>
                <p className="text-muted-foreground">Manage your farm products</p>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading your products...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-2">Image</th>
                      <th className="text-left py-4 px-2">Name</th>
                      <th className="text-left py-4 px-2">Category</th>
                      <th className="text-left py-4 px-2">Price</th>
                      <th className="text-left py-4 px-2">Quantity</th>
                      <th className="text-right py-4 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-border">
                        <td className="py-4 px-2">
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-secondary">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-2 font-medium">{product.name}</td>
                        <td className="py-4 px-2 capitalize">{product.category}</td>
                        <td className="py-4 px-2">${product.price.toFixed(2)}</td>
                        <td className="py-4 px-2">{product.quantity || 0} kg</td>
                        <td className="py-4 px-2">
                          <div className="flex justify-end gap-2">
                            <button className="p-2 hover:bg-secondary rounded-full transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-2 hover:bg-secondary rounded-full transition-colors"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-secondary/50 rounded-xl">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Products Found</h3>
                <p className="text-muted-foreground mb-4">You haven't added any products yet.</p>
                <AnimatedButton 
                  onClick={() => setShowAddModal(true)}
                  icon={<PlusCircle className="w-5 h-5" />}
                  iconPosition="left"
                >
                  Add Your First Product
                </AnimatedButton>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h3 className="text-xl font-semibold">Add New Product</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Product Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g., Organic Tomatoes"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                  placeholder="Describe your product..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium">Price ($)</label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">Category</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="herbs">Herbs</option>
                    <option value="flowers">Flowers</option>
                    <option value="byproducts">Byproducts</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="quantity" className="text-sm font-medium">Quantity Available (kg)</label>
                <input
                  id="quantity"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter available quantity"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="image" className="text-sm font-medium">Product Image</label>
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => document.getElementById('image')?.click()}
                >
                  {image ? (
                    <div className="space-y-2">
                      <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden">
                        <img 
                          src={URL.createObjectURL(image)} 
                          alt="Product preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">{image.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Click to upload image</p>
                    </div>
                  )}
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <AnimatedButton 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </AnimatedButton>
                <AnimatedButton 
                  type="submit"
                  disabled={uploading}
                >
                  {uploading ? 'Adding...' : 'Add Product'}
                </AnimatedButton>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default FarmerDashboard;
