
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

// Define price data interfaces
interface PriceData {
  id: string;
  name: string;
  category: 'vegetables' | 'fruits';
  price: number;
  unit: string;
  priceChange: number;
  lastUpdated: string;
  market: string;
}

const MarketPrices = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'vegetables' | 'fruits'>('all');

  // Fetch market price data
  const { data: priceData, isLoading, error } = useQuery({
    queryKey: ['marketPrices'],
    queryFn: async () => {
      try {
        // In a real app, this would be an API call to get real-time data
        // For demo purposes, we're using mock data
        return getMockPriceData();
      } catch (error) {
        throw new Error('Failed to fetch market prices');
      }
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Filter data based on search term and active category
  const filteredData = priceData?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.market.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load market prices. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Function to determine price trend color and icon
  const getPriceTrend = (priceChange: number) => {
    if (priceChange > 0) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: <TrendingUp className="h-3 w-3" />,
        label: 'increase'
      };
    } else if (priceChange < 0) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: <TrendingDown className="h-3 w-3" />,
        label: 'decrease'
      };
    } else {
      return {
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        icon: null,
        label: 'stable'
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Market Prices</h2>
          <p className="text-muted-foreground">
            Current wholesale prices in Indian markets
          </p>
        </div>
        
        <div className="relative w-full sm:w-auto min-w-[240px]">
          <Input
            placeholder="Search by name or market..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-8"
          />
        </div>
      </div>

      {/* Price summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Vegetable Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `₹${calculateAverage(priceData || [], 'vegetables')}/kg`
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Fruit Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `₹${calculateAverage(priceData || [], 'fruits')}/kg`
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Updated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                formatLastUpdated(priceData?.[0]?.lastUpdated || '')
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="vegetables">Vegetables</TabsTrigger>
          <TabsTrigger value="fruits">Fruits</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <PriceTable data={filteredData} isLoading={isLoading} getPriceTrend={getPriceTrend} />
        </TabsContent>
        
        <TabsContent value="vegetables" className="mt-0">
          <PriceTable data={filteredData} isLoading={isLoading} getPriceTrend={getPriceTrend} />
        </TabsContent>
        
        <TabsContent value="fruits" className="mt-0">
          <PriceTable data={filteredData} isLoading={isLoading} getPriceTrend={getPriceTrend} />
        </TabsContent>
      </Tabs>

      <div className="text-xs text-muted-foreground mt-6">
        <p>* Prices are indicative wholesale rates and may vary by location and quality.</p>
        <p>* Data refreshes automatically every minute.</p>
      </div>
    </div>
  );
};

// Helper component for the price table
const PriceTable = ({ 
  data, 
  isLoading, 
  getPriceTrend 
}: { 
  data: PriceData[]; 
  isLoading: boolean;
  getPriceTrend: (priceChange: number) => {
    color: string;
    bgColor: string;
    icon: React.ReactNode;
    label: string;
  };
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-10 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No matching items found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price (₹)</TableHead>
            <TableHead>Change</TableHead>
            <TableHead>Market</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const trend = getPriceTrend(item.priceChange);
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {item.category}
                  </Badge>
                </TableCell>
                <TableCell>₹{item.price}/{item.unit}</TableCell>
                <TableCell>
                  <div className={`flex items-center ${trend.color}`}>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${trend.bgColor} ${trend.color}`}>
                      {trend.icon}
                      <span className="ml-1">
                        {Math.abs(item.priceChange)}%
                      </span>
                    </span>
                  </div>
                </TableCell>
                <TableCell>{item.market}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatTime(item.lastUpdated)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

// Helper functions
function calculateAverage(data: PriceData[], category: 'vegetables' | 'fruits'): string {
  const filtered = data.filter(item => item.category === category);
  if (filtered.length === 0) return '0.00';
  
  const total = filtered.reduce((sum, item) => sum + item.price, 0);
  return (total / filtered.length).toFixed(2);
}

function formatLastUpdated(dateString: string): string {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', { 
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatTime(dateString: string): string {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', { 
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Mock data function - in a real app this would be replaced with an API call
function getMockPriceData(): PriceData[] {
  const now = new Date().toISOString();
  
  return [
    {
      id: '1',
      name: 'Tomato',
      category: 'vegetables',
      price: 25.50,
      unit: 'kg',
      priceChange: 2.5,
      lastUpdated: now,
      market: 'Azadpur Mandi, Delhi'
    },
    {
      id: '2',
      name: 'Onion',
      category: 'vegetables',
      price: 18.75,
      unit: 'kg',
      priceChange: -3.2,
      lastUpdated: now,
      market: 'Vashi Market, Mumbai'
    },
    {
      id: '3',
      name: 'Potato',
      category: 'vegetables',
      price: 15.25,
      unit: 'kg',
      priceChange: 0,
      lastUpdated: now,
      market: 'Binny Mills, Bangalore'
    },
    {
      id: '4',
      name: 'Apple (Shimla)',
      category: 'fruits',
      price: 120.00,
      unit: 'kg',
      priceChange: 5.8,
      lastUpdated: now,
      market: 'Azadpur Mandi, Delhi'
    },
    {
      id: '5',
      name: 'Banana',
      category: 'fruits',
      price: 45.00,
      unit: 'dozen',
      priceChange: -1.5,
      lastUpdated: now,
      market: 'Koyambedu Market, Chennai'
    },
    {
      id: '6',
      name: 'Cauliflower',
      category: 'vegetables',
      price: 30.50,
      unit: 'kg',
      priceChange: 4.2,
      lastUpdated: now,
      market: 'Rythu Bazar, Hyderabad'
    },
    {
      id: '7',
      name: 'Mango (Alphonso)',
      category: 'fruits',
      price: 350.00,
      unit: 'kg',
      priceChange: -2.7,
      lastUpdated: now,
      market: 'Crawford Market, Mumbai'
    },
    {
      id: '8',
      name: 'Brinjal',
      category: 'vegetables',
      price: 22.75,
      unit: 'kg',
      priceChange: 1.8,
      lastUpdated: now,
      market: 'Bowenpally Market, Hyderabad'
    },
    {
      id: '9',
      name: 'Green Chili',
      category: 'vegetables',
      price: 40.00,
      unit: 'kg',
      priceChange: 8.5,
      lastUpdated: now,
      market: 'Azadpur Mandi, Delhi'
    },
    {
      id: '10',
      name: 'Orange',
      category: 'fruits',
      price: 85.50,
      unit: 'kg',
      priceChange: -1.2,
      lastUpdated: now,
      market: 'Koyambedu Market, Chennai'
    },
    {
      id: '11',
      name: 'Cucumber',
      category: 'vegetables',
      price: 18.00,
      unit: 'kg',
      priceChange: 0,
      lastUpdated: now,
      market: 'Rythu Bazar, Hyderabad'
    },
    {
      id: '12',
      name: 'Watermelon',
      category: 'fruits',
      price: 22.00,
      unit: 'kg',
      priceChange: -5.3,
      lastUpdated: now,
      market: 'Binny Mills, Bangalore'
    }
  ];
}

export default MarketPrices;
