import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CartIcon from '@/components/Cart/CartIcon';
import { useCart } from '@/contexts/CartContext';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter
} from "@/components/ui/sheet";
import { Minus, Plus, Trash2 } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  exact?: boolean;
}

const navItems: NavItem[] = [
  { to: "/", label: "Home", exact: true },
  { to: "/farmers", label: "Farmers" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full bg-background border-b",
      mobileMenuOpen ? 'overflow-y-auto h-screen' : 'overflow-hidden'
    )}>
      <div className="container flex items-center justify-between py-4 px-6">
        <Link to="/" className="font-bold text-xl md:text-2xl">
          FarmConnect
        </Link>
        
        <nav className={cn(
          "hidden md:flex items-center gap-6",
          mobileMenuOpen ? 'flex flex-col absolute top-full left-0 w-full bg-background p-6' : ''
        )}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium hover:text-primary transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
              end={item.exact}
            >
              {item.label}
            </NavLink>
          ))}
          
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <CartIcon />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Your Cart</SheetTitle>
                  <SheetDescription>
                    {totalItems > 0 
                      ? `You have ${totalItems} item${totalItems > 1 ? 's' : ''} in your cart.`
                      : 'Your cart is empty.'
                    }
                  </SheetDescription>
                </SheetHeader>
                
                {items.length > 0 ? (
                  <div className="mt-6 flex flex-col gap-4">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-4 border-b pb-4">
                        <div className="w-16 h-16 overflow-hidden rounded-md flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-muted-foreground text-xs">
                            {item.farmer.name}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-sm">₹{item.price.toFixed(2)}</div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-5 text-center text-sm">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-destructive"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold">₹{totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <Button variant="outline" onClick={clearCart}>
                          Clear Cart
                        </Button>
                        <Button>
                          Checkout
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-60">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                    <SheetClose asChild>
                      <Button variant="outline" className="mt-4">
                        Continue Shopping
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </SheetContent>
            </Sheet>
            
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    Profile
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/sign-up">
                  <Button variant="default" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </nav>
        
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
