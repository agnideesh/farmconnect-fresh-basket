import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeInitializer } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import Farmers from '@/pages/Farmers';
import FarmerProfile from '@/pages/FarmerProfile';
import SignUp from '@/pages/SignUp';
import SignIn from '@/pages/SignIn';
import Dashboard from '@/pages/Dashboard';
import RequireAuth from '@/components/Auth/RequireAuth';
import Products from '@/pages/Products';
import { CartProvider } from '@/contexts/CartContext';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <ThemeInitializer>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CartProvider>
              <Toaster />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/farmers" element={<Farmers />} />
                <Route path="/farmers/:farmerId" element={<FarmerProfile />} />
                <Route path="/products" element={<Products />} />
                <Route path="/sign-up" element={<SignUp />} />
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/dashboard" element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                } />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeInitializer>
    </BrowserRouter>
  );
}

export default App;
