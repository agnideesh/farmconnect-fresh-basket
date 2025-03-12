
import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-primary rounded-full opacity-20"></div>
                <div className="absolute inset-0 flex items-center justify-center text-primary font-semibold text-xl">FC</div>
              </div>
              <span className="text-2xl font-semibold">FarmConnect</span>
            </Link>
            <p className="text-muted-foreground">
              Connecting farmers and consumers directly for fresher, healthier food and stronger communities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors">Products</Link>
              </li>
              <li>
                <Link to="/farmers" className="text-muted-foreground hover:text-foreground transition-colors">Farmers</Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=vegetables" className="text-muted-foreground hover:text-foreground transition-colors">Vegetables</Link>
              </li>
              <li>
                <Link to="/products?category=fruits" className="text-muted-foreground hover:text-foreground transition-colors">Fruits</Link>
              </li>
              <li>
                <Link to="/products?category=herbs" className="text-muted-foreground hover:text-foreground transition-colors">Herbs</Link>
              </li>
              <li>
                <Link to="/products?category=flowers" className="text-muted-foreground hover:text-foreground transition-colors">Flowers</Link>
              </li>
              <li>
                <Link to="/products?category=byproducts" className="text-muted-foreground hover:text-foreground transition-colors">Farm Byproducts</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} FarmConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
