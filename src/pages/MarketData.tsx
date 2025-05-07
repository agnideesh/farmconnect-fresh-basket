
import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import MarketPrices from '@/components/Market/MarketPrices';

const MarketData = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-6 py-8">
          <MarketPrices />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MarketData;
