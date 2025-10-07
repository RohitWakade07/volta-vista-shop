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
  Download,
  Image,
  Settings,
  UserCheck
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
// Cloud Functions disabled for Spark plan compatibility
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import app from '@/lib/firebase';
import { PaymentService } from '@/services/paymentService';
import { ProductService } from '@/services/productService';
import { UserService } from '@/services/userService';
import { Order } from '@/types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  monthlyGrowth: number;
  averageOrderValue: number;
  activeUsers: number;
  newUsersThisMonth: number;
}

const Dashboard = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    monthlyGrowth: 0,
    averageOrderValue: 0,
    activeUsers: 0,
    newUsersThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  // subscribe realtime
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    console.log('Dashboard: Setting up data subscriptions...');
    
    const unsubProducts = ProductService.subscribeProducts((items) => {
      console.log('Dashboard: Received products:', items.length);
      setStats(prev => ({ ...prev, totalProducts: items.length }));
    });
    
    const unsubOrders = PaymentService.subscribeAllOrders((os) => {
      console.log('Dashboard: Received orders:', os.length);
      setOrders(os);
      const totalRevenue = os.reduce((s, o) => s + (o.total || 0), 0);
      const averageOrderValue = os.length > 0 ? totalRevenue / os.length : 0;
      setStats(prev => ({ ...prev, totalOrders: os.length, totalRevenue, averageOrderValue }));    
    });
    
    // Load user statistics
    console.log('Dashboard: Loading user stats...');
    UserService.getUserStats().then((userStats) => {
      console.log('Dashboard: Received user stats:', userStats);
      setStats(prev => ({ 
        ...prev, 
        totalUsers: userStats.totalUsers,
        activeUsers: userStats.activeThisWeek,
        newUsersThisMonth: userStats.newThisMonth
      }));
    }).catch((error) => {
      console.error('Dashboard: Error loading user stats:', error);
    });

    return () => { 
      console.log('Dashboard: Cleaning up subscriptions...');
      unsubProducts(); 
      unsubOrders(); 
    };
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">                                                                             
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">                                                                  
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>                                                                     
              <p className="text-xs text-muted-foreground">
                +{stats.newUsersThisMonth} new this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">                                                                  
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>                                                                               
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />        
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>                                                                    
              <p className="text-xs text-muted-foreground">
                Avg: ₹{stats.averageOrderValue.toFixed(0)} per order
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
                From {stats.totalOrders} orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">                                                                  
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>   
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>   
              <p className="text-xs text-muted-foreground">
                Active in last 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Access
            </CardTitle>
            <CardDescription>Manage your store settings and content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/admin/products">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Package className="h-6 w-6" />
                  <span>Manage Products</span>
                </Button>
              </Link>
              <Link to="/admin/orders">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  <span>View Orders</span>
                </Button>
              </Link>
              <Link to="/admin/promos">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <DollarSign className="h-6 w-6" />
                  <span>Promo Codes</span>
                </Button>
              </Link>
              <Link to="/admin/images">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Image className="h-6 w-6" />
                  <span>Upload Images</span>
                </Button>
              </Link>
              <Link to="/admin/featured-offer">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Settings className="h-6 w-6" />
                  <span>Featured Offer</span>
                </Button>
              </Link>
              <Link to="/admin/users">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">                                       
                  <Users className="h-6 w-6" />
                  <span>User Management</span>
                </Button>
              </Link>
              <Link to="/admin/data-test">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">                                       
                  <RefreshCw className="h-6 w-6" />
                  <span>Data Test</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Status Distribution</CardTitle>
                  <CardDescription>Orders by status</CardDescription>     
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: '#10b981' },
                            { name: 'Shipped', value: orders.filter(o => o.status === 'shipped').length, color: '#8b5cf6' },
                            { name: 'Processing', value: orders.filter(o => o.status === 'processing').length, color: '#3b82f6' },
                            { name: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: '#f59e0b' },
                            { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, color: '#ef4444' }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {[
                            { name: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: '#10b981' },
                            { name: 'Shipped', value: orders.filter(o => o.status === 'shipped').length, color: '#8b5cf6' },
                            { name: 'Processing', value: orders.filter(o => o.status === 'processing').length, color: '#3b82f6' },
                            { name: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: '#f59e0b' },
                            { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, color: '#ef4444' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method Distribution</CardTitle>
                  <CardDescription>Orders by payment method</CardDescription>     
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'PhonePe', value: orders.filter(o => o.paymentMethod === 'phonepe').length },
                        { name: 'COD', value: orders.filter(o => o.paymentMethod === 'cod').length },
                        { name: 'Card', value: orders.filter(o => o.paymentMethod === 'card').length }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity Overview</CardTitle>
                  <CardDescription>User engagement metrics</CardDescription>   
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Total Users</span>
                      </div>
                      <span className="text-lg font-bold">{stats.totalUsers}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Active This Week</span>
                      </div>
                      <span className="text-lg font-bold">{stats.activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">New This Month</span>
                      </div>
                      <span className="text-lg font-bold">{stats.newUsersThisMonth}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Monthly user registrations</CardDescription>   
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">                                                                   
                    User growth chart will be implemented with user registration data
                  </div>
                </CardContent>
              </Card>
            </div>
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