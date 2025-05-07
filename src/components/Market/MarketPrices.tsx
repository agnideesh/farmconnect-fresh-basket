
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

// Define types for market data
interface MarketItem {
  id: string;
  commodity_name: string;
  category: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  unit: string;
  market: string;
  price_change_percentage: number;
  created_at: string;
}

const fetchMarketPrices = async () => {
  const response = await fetch('/api/edge/market-prices');
  if (!response.ok) {
    throw new Error('Failed to fetch market prices');
  }
  return response.json();
};

const fetchStoredMarketData = async () => {
  const { data, error } = await supabase
    .from('marketplace_items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) throw error;
  return data;
};

const MarketPrices = () => {
  const [activeTab, setActiveTab] = useState('live');

  const liveDataQuery = useQuery({
    queryKey: ['marketPrices', 'live'],
    queryFn: fetchMarketPrices,
    enabled: activeTab === 'live',
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 30, // 30 minutes
  });

  const storedDataQuery = useQuery({
    queryKey: ['marketPrices', 'stored'],
    queryFn: fetchStoredMarketData,
    enabled: activeTab === 'stored',
    refetchOnWindowFocus: false,
  });

  // Format price with commas and decimals
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  };

  // Create chart data from market items
  const createChartData = (items: MarketItem[]) => {
    const categories = Array.from(new Set(items.map(item => item.category)));
    return categories.map(category => {
      const categoryItems = items.filter(item => item.category === category);
      const avgPrice = categoryItems.reduce((sum, item) => sum + item.modal_price, 0) / categoryItems.length;
      return {
        name: category,
        price: avgPrice,
      };
    });
  };

  // Determine which data to show based on active tab
  const marketData = activeTab === 'live' ? liveDataQuery.data?.data : storedDataQuery.data || [];
  const isLoading = activeTab === 'live' ? liveDataQuery.isLoading : storedDataQuery.isLoading;
  const error = activeTab === 'live' ? liveDataQuery.error : storedDataQuery.error;
  const chartData = marketData ? createChartData(marketData) : [];

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle>Agricultural Market Prices</CardTitle>
        <CardDescription>
          Current market prices for various agricultural commodities
        </CardDescription>
        <Tabs defaultValue="live" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="live">Live API Data</TabsTrigger>
            <TabsTrigger value="stored">Stored Database Data</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">
            Error loading market data. Please try again later.
          </div>
        ) : marketData && marketData.length > 0 ? (
          <>
            <div className="mb-6 overflow-x-auto">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Avg Price (USD)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${formatPrice(value as number)}`, 'Avg Price']} />
                  <Legend />
                  <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-3 text-left text-gray-800 dark:text-gray-200">Commodity</th>
                    <th className="p-3 text-left text-gray-800 dark:text-gray-200">Category</th>
                    <th className="p-3 text-left text-gray-800 dark:text-gray-200">Price</th>
                    <th className="p-3 text-left text-gray-800 dark:text-gray-200">Market</th>
                    <th className="p-3 text-left text-gray-800 dark:text-gray-200">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {marketData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="p-3">{item.commodity_name}</td>
                      <td className="p-3">{item.category}</td>
                      <td className="p-3">{formatPrice(item.modal_price)}</td>
                      <td className="p-3">{item.market}</td>
                      <td className={`p-3 ${item.price_change_percentage > 0 ? 'text-green-500' : item.price_change_percentage < 0 ? 'text-red-500' : ''}`}>
                        {item.price_change_percentage > 0 ? '+' : ''}{item.price_change_percentage.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center p-4">No market data available.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketPrices;
