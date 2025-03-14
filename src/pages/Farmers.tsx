
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import FarmerCard from '@/components/Farmers/FarmerCard';

// Mock data for farmers
const farmersMockData = [
  {
    id: '44e19264-b00c-44fb-b922-f29e68021331',
    name: 'John Smith',
    location: 'Karnataka, India',
    specialties: ['Organic Vegetables', 'Fruits'],
    image: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFybWVyfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    bio: 'Third-generation farmer specializing in organic produce with sustainable practices.',
    phone_number: '+91 98765 43210',
    email: 'john.smith@example.com',
    latitude: 12.9716,
    longitude: 77.5946
  },
  {
    id: '5e7f3a2b-8c9d-4e5f-a6b7-1c2d3e4f5a6b',
    name: 'Priya Sharma',
    location: 'Tamil Nadu, India',
    specialties: ['Rice', 'Spices'],
    image: 'https://images.unsplash.com/photo-1594761051685-a2e4d108e240?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGluZGlhbiUyMGZhcm1lcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    bio: 'Passionate about traditional farming methods and heirloom crop varieties.',
    phone_number: '+91 87654 32109',
    email: 'priya.sharma@example.com',
    latitude: 11.1271,
    longitude: 78.6569
  },
  {
    id: '7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p',
    name: 'Raj Patel',
    location: 'Gujarat, India',
    specialties: ['Cotton', 'Groundnuts'],
    image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aW5kaWFuJTIwZmFybWVyfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    bio: 'Leading sustainable agriculture initiatives in the region for over 15 years.',
    phone_number: '+91 76543 21098',
    email: 'raj.patel@example.com',
    latitude: 22.2587,
    longitude: 71.1924
  }
];

const Farmers: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Our Farmers | FarmConnect</title>
      </Helmet>
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Our Farmers</h1>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Meet the dedicated farmers who grow the fresh produce available on FarmConnect. 
          Connect directly with them to learn more about their farming practices and products.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {farmersMockData.map((farmer) => (
            <Link key={farmer.id} to={`/farmers/${farmer.id}`}>
              <FarmerCard farmer={farmer} />
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Farmers;
