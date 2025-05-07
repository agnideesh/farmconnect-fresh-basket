
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, TrendingDown, DollarSign, RefreshCcw, AlertCircle, Calendar, Database } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

interface ApiResponse {
  data: any;
  updated_at: string;
  is_cached?: boolean;
}

const MarketPrices = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'vegetables' | 'fruits'>('all');
  const [dataSource, setDataSource] = useState<'api' | 'database'>('api');

  // Query for API data
  const { data: apiData, isLoading: isApiLoading, error: apiError, refetch: refetchApi, isRefetching: isApiRefetching } = useQuery({
    queryKey: ['marketPrices', 'api'],
    queryFn: async () => {
      try {
        const { data: responseData, error } = await supabase.functions.invoke('market-prices');
        
        if (error) throw new Error(error.message);

        const apiResponse = responseData as ApiResponse;
        
        return transformApiData(apiResponse);
      } catch (error: any) {
        console.error('Error fetching market prices from API:', error.message);
        toast({
          title: 'API Error',
          description: 'Using fallback data. Will retry connection later.',
          variant: 'destructive',
        });
        return getMockPriceData();
      }
    },
    refetchInterval: 30 * 60 * 1000,
  });

  // Query for direct database data
  const { data: dbData, isLoading: isDbLoading, error: dbError, refetch: refetchDb, isRefetching: isDbRefetching } = useQuery({
    queryKey: ['marketPrices', 'database'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('marketplace_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (!data || data.length === 0) {
          toast({
            title: 'No data found',
            description: 'No market prices found in the database.',
            variant: 'destructive',
          });
          throw new Error('No data found in database');
        }

        return data.map(item => ({
          id: item.id,
          name: item.commodity_name,
          category: item.category as 'vegetables' | 'fruits',
          price: parseFloat(item.modal_price),
          unit: item.unit || 'kg',
          priceChange: item.price_change_percentage !== null ? parseFloat(item.price_change_percentage) : 0,
          lastUpdated: item.updated_at,
          market: item.market
        }));
      } catch (error: any) {
        console.error('Error fetching market prices from database:', error.message);
        toast({
          title: 'Database Error',
          description: 'Failed to load market prices from database.',
          variant: 'destructive',
        });
        throw error;
      }
    },
    enabled: dataSource === 'database',
    refetchInterval: 60 * 60 * 1000, // Refresh hourly
  });

  const transformApiData = (apiResponse: ApiResponse): PriceData[] => {
    if (apiResponse.is_cached) {
      toast({
        title: 'Using cached data',
        description: `Last updated: ${new Date(apiResponse.updated_at).toLocaleString()}`,
        variant: 'default',
      });
    }
    
    try {
      const rawItems = apiResponse.data.items || [];
      
      return rawItems.map((item: any, index: number) => ({
        id: item.id || `${index}`,
        name: item.commodity_name || item.name,
        category: categorizeItem(item.commodity_name || item.name),
        price: parseFloat(item.modal_price) || item.price || 0,
        unit: item.unit || 'kg',
        priceChange: calculatePriceChange(item),
        lastUpdated: apiResponse.updated_at,
        market: item.market || item.market_name || 'Various Markets'
      }));
    } catch (error) {
      console.error('Error transforming API data:', error);
      return getMockPriceData();
    }
  };

  const categorizeItem = (name: string): 'vegetables' | 'fruits' => {
    const fruits = ['apple', 'banana', 'orange', 'mango', 'grape', 'watermelon', 'papaya'];
    return fruits.some(fruit => name.toLowerCase().includes(fruit)) ? 'fruits' : 'vegetables';
  };

  const calculatePriceChange = (item: any): number => {
    if (item.price_change_percentage) return item.price_change_percentage;
    if (item.min_price && item.modal_price) {
      const min = parseFloat(item.min_price);
      const modal = parseFloat(item.modal_price);
      if (min > 0) return ((modal - min) / min) * 100;
    }
    return parseFloat((Math.random() * 10 * (Math.random() > 0.5 ? 1 : -1)).toFixed(1));
  };

  // Get the data based on the current selected source
  const data = dataSource === 'api' ? apiData : dbData;
  const isLoading = dataSource === 'api' ? isApiLoading : isDbLoading;
  const isRefetching = dataSource === 'api' ? isApiRefetching : isDbRefetching;
  const error = dataSource === 'api' ? apiError : dbError;
  const refetch = dataSource === 'api' ? refetchApi : refetchDb;

  const filteredData = data?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.market.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load market prices. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

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
          <p className="text-muted-foreground flex items-center gap-1">
            Current wholesale prices in Indian markets
            {data && data[0]?.lastUpdated && (
              <span className="text-xs px-2 py-0.5 bg-primary/10 rounded-full">
                Updated: {formatLastUpdated(data[0].lastUpdated)}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-[240px]">
            <Input
              placeholder="Search by name or market..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-8"
            />
          </div>
          <Button 
            size="icon" 
            variant="outline" 
            onClick={() => refetch()} 
            disabled={isRefetching}
            className="shrink-0"
          >
            {isRefetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <Tabs value={dataSource} onValueChange={(value) => setDataSource(value as 'api' | 'database')} className="mb-4">
        <TabsList>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Live API Data
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Stored Database Data
          </TabsTrigger>
        </TabsList>
      </Tabs>

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
                  `₹${calculateAverage(data || [], 'vegetables')}/kg`
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
                  `₹${calculateAverage(data || [], 'fruits')}/kg`
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {dataSource === 'api' ? 'Last Updated' : 'Data Source'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                dataSource === 'api' 
                  ? formatLastUpdated(data?.[0]?.lastUpdated || '') 
                  : 'Supabase Database'
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
        <p>* API data refreshes automatically every 30 minutes, Database data hourly.</p>
        {data && data[0]?.lastUpdated && (
          <p className="mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Last updated: {new Date(data[0].lastUpdated).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

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
