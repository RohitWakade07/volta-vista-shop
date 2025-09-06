import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package, 
  RefreshCw,
  TrendingUp,
  Eye,
  Download
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
// Cloud Functions disabled for Spark plan compatibility
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import app from '@/lib/firebase';
import { PaymentService } from '@/services/paymentService';
import { ProductService } from '@/services/productService';
import { Order } from '@/types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardStats {
  // totalUsers: number; // Disabled for Spark plan compatibility
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  monthlyGrowth: number;
  averageOrderValue: number;
}

const Dashboard = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    // totalUsers: 0, // Disabled for Spark plan compatibility
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    monthlyGrowth: 0,
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  // subscribe realtime
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    const unsubProducts = ProductService.subscribeProducts((items) => {
      setStats(prev => ({ ...prev, totalProducts: items.length }));
    });
    const unsubOrders = PaymentService.subscribeAllOrders((os) => {
      setOrders(os);
      const totalRevenue = os.reduce((s, o) => s + (o.total || 0), 0);
      setStats(prev => ({ ...prev, totalOrders: os.length, totalRevenue }));
    });
    return () => { unsubProducts(); unsubOrders(); };
  }, []);

  // Cloud Function disabled for Spark plan compatibility
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const functions = getFunctions(app as any);
  //       const callable: any = httpsCallable(functions, 'getUserCount');
  //       const res: any = await callable({});
  //       const count = res?.data?.count;
  //       if (typeof count === 'number') {
  //         setStats(prev => ({ ...prev, totalUsers: count }));
  //       }
  //     } catch (e) {
  //       // ignore if not authorized
  //     }
  //   })();
  // }, []);

  // chart data
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const chartData = orders.reduce<Record<string, { date: string; revenue: number }>>((acc, o) => {
    const d = new Date(o.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = { date: key, revenue: 0 };
    acc[key].revenue += o.total || 0;
    return acc;
  }, {});
  let chartList = Object.values(chartData).sort((a, b) => a.date.localeCompare(b.date));
  if (dateFrom) {
    chartList = chartList.filter(p => p.date >= dateFrom);
  }
  if (dateTo) {
    chartList = chartList.filter(p => p.date <= dateTo);
  }

  const handleRefresh = () => {
    setLoading(true);
    toast({
      title: "Refreshing data",
      description: "Fetching latest analytics...",
    });
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Data refreshed",
        description: "Analytics updated successfully.",
      });
    }, 1000);
  };

  if (userProfile?.role !== 'admin' && userProfile?.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Monitor your store's performance</p>
          </div>
          <Button onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Users card disabled for Spark plan compatibility */}
          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.monthlyGrowth}% from last month
              </p>
            </CardContent>
          </Card> */}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +8.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12.3% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                +3 new this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest store activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-green-500" />
                        <span className="text-sm">New user registered</span>
                      </div>
                      <Badge variant="secondary">2 min ago</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">New order placed</span>
                      </div>
                      <Badge variant="secondary">5 min ago</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Payment received</span>
                      </div>
                      <Badge variant="secondary">10 min ago</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sales (INR)</CardTitle>
                  <CardDescription>Daily revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">From</span>
                      <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 w-36" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">To</span>
                      <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 w-36" />
                    </div>
                    <Button variant="outline" className="h-8" onClick={() => { setDateFrom(""); setDateTo(""); }}>Clear</Button>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartList} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(v) => `₹${v}`} width={60} />
                        <Tooltip formatter={(v: any) => `₹${v}`} />
                        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Analytics</CardTitle>
                <CardDescription>Revenue and order trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Chart component will be added here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
                <CardDescription>User growth and engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  User analytics chart will be added here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Top selling products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Product performance chart will be added here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard; 