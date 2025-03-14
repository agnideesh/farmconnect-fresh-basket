
import React from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  
  // Render different dashboards based on user type
  const renderDashboardContent = () => {
    if (!profile) return <p>Loading profile information...</p>;
    
    if (profile.user_type === 'farmer') {
      return <FarmerDashboardContent />;
    } else {
      return <CustomerDashboardContent />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | FarmConnect</title>
      </Helmet>
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Welcome back, {profile?.full_name || user?.email}!
        </p>
        
        {renderDashboardContent()}
      </main>
      <Footer />
    </>
  );
};

const CustomerDashboardContent: React.FC = () => {
  return (
    <Tabs defaultValue="orders">
      <TabsList className="mb-6">
        <TabsTrigger value="orders">My Orders</TabsTrigger>
        <TabsTrigger value="favorites">Favorite Products</TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
      </TabsList>
      
      <TabsContent value="orders">
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
            <CardDescription>View your order history and track current orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>You haven't placed any orders yet.</p>
              <p className="mt-2">Browse our products and place your first order!</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="favorites">
        <Card>
          <CardHeader>
            <CardTitle>Favorite Products</CardTitle>
            <CardDescription>Products you've saved for later</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>You haven't saved any favorites yet.</p>
              <p className="mt-2">Add products to your favorites for quick access!</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Manage your account settings and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Name</div>
                <div className="col-span-2">John Doe</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Email</div>
                <div className="col-span-2">john.doe@example.com</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Phone</div>
                <div className="col-span-2">+91 98765 43210</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Address</div>
                <div className="col-span-2">123 Main St, Bangalore, Karnataka, India</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

const FarmerDashboardContent: React.FC = () => {
  return (
    <Tabs defaultValue="products">
      <TabsList className="mb-6">
        <TabsTrigger value="products">My Products</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
      </TabsList>
      
      <TabsContent value="products">
        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
            <CardDescription>Manage your product listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>You haven't added any products yet.</p>
              <p className="mt-2">Add your first product to start selling!</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="orders">
        <Card>
          <CardHeader>
            <CardTitle>Customer Orders</CardTitle>
            <CardDescription>View and manage orders from customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>You don't have any customer orders yet.</p>
              <p className="mt-2">Orders will appear here once customers purchase your products.</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <CardTitle>Sales Analytics</CardTitle>
            <CardDescription>Track your sales performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>No sales data available yet.</p>
              <p className="mt-2">Sales analytics will be shown here once you have orders.</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Farmer Profile</CardTitle>
            <CardDescription>Manage your public farmer profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Name</div>
                <div className="col-span-2">John Smith</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Farm Name</div>
                <div className="col-span-2">Smith Family Farms</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Location</div>
                <div className="col-span-2">Karnataka, India</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Specialties</div>
                <div className="col-span-2">Organic Vegetables, Fruits</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Bio</div>
                <div className="col-span-2">Third-generation farmer specializing in organic produce with sustainable practices.</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default Dashboard;
