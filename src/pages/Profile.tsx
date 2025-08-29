import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  ShoppingBag, 
  Gift, 
  Copy, 
  LogOut,
  Calendar,
  DollarSign,
  Users,
  Eye,
  Loader2,
  AlertCircle,
  Package,
  Truck,
  CheckCircle,
  Moon,
  Sun
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { PaymentService } from '@/services/paymentService';
import { Order } from '@/types';

interface Referral {
  email: string;
  displayName: string;
  date: Date;
  status: 'pending' | 'completed';
}

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [showReferralCode, setShowReferralCode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access your profile.",
        variant: "destructive"
      });
      navigate('/auth/login');
    }
  }, [currentUser, authLoading, navigate, toast]);

  // Subscribe to user orders in realtime
  useEffect(() => {
    if (!userProfile?.uid) {
      setOrdersLoading(false);
      return;
    }
    setOrdersLoading(true);
    const unsub = PaymentService.subscribeUserOrders(userProfile.uid, (os) => {
      setOrders(os);
      setOrdersLoading(false);
    });
    return () => unsub();
  }, [userProfile?.uid]);

  // Fetch referrals data from Firebase (placeholder for now)
  useEffect(() => {
    // TODO: Implement Firebase referrals fetching
    setReferrals([]);
    setLoading(false);
  }, []);

  const copyReferralCode = () => {
    if (userProfile?.referralCode) {
      navigator.clipboard.writeText(userProfile.referralCode);
      toast({
        title: "Referral code copied!",
        description: "Share this code with friends to earn rewards.",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500';
      case 'shipped': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'refunded': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getReferralStatusColor = (status: string) => {
    return status === 'completed' ? 'bg-green-500' : 'bg-yellow-500';
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLogoutLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show loading state if user is not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Loading Profile</CardTitle>
            <CardDescription className="text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Please wait while we load your profile...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Profile Not Found</CardTitle>
            <CardDescription className="text-center">
              Please log in to view your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth/login')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your account and view your activity</p>
          </div>
          <div className="flex items-center gap-2">
            {userProfile.role === 'superadmin' && (
              <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
                Admin Panel
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/')}>← Back to Home</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>{userProfile.displayName}</CardTitle>
                    <CardDescription>{userProfile.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Referral Code</label>
                  <div className="flex items-center space-x-2">
                    <input
                      value={showReferralCode ? userProfile.referralCode : '••••••'}
                      readOnly
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReferralCode(!showReferralCode)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyReferralCode}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{userProfile.referralCount}</div>
                    <div className="text-xs text-muted-foreground">Referrals</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">₹{userProfile.totalEarnings}</div>
                    <div className="text-xs text-muted-foreground">Earnings</div>
                  </div>
                </div>

                {/* Theme Toggle */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme</label>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between" 
                    onClick={toggleTheme}
                  >
                    <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    {theme === 'dark' ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleLogout}
                  disabled={logoutLoading}
                >
                  {logoutLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="orders" className="space-y-6">
              <TabsList>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="referrals">Referrals</TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>View your past orders and their status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No orders yet</p>
                        <p className="text-sm text-muted-foreground">Start shopping to see your orders here</p>
                        <Button onClick={() => navigate('/')} className="mt-4">
                          Start Shopping
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-semibold">{order.id}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {order.createdAt.toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(order.status)}>
                                  {getStatusIcon(order.status)}
                                  <span className="ml-1">{order.status}</span>
                                </Badge>
                                <Badge variant="outline" className={getPaymentStatusColor(order.paymentStatus)}>
                                  {order.paymentStatus}
                                </Badge>
                                <span className="font-semibold">₹{order.total}</span>
                                <Button size="sm" variant="outline" onClick={() => navigate(`/orders/${order.id}`)}>
                                  View details
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{item.name} x{item.quantity}</span>
                                  <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                                </div>
                              ))}
                            </div>
                            {order.shippingAddress && (
                              <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                                <p><strong>Ship to:</strong> {order.shippingAddress.name}</p>
                                <p>{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="referrals" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Referral Program</CardTitle>
                    <CardDescription>Track your referrals and earnings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Gift className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Share Your Referral Code</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Share your referral code with friends and earn rewards when they sign up!
                      </p>
                      <div className="flex items-center space-x-2">
                        <input
                          value={userProfile.referralCode}
                          readOnly
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                        />
                        <Button onClick={copyReferralCode} size="sm">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Your Referrals</h3>
                      {referrals.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No referrals yet</p>
                          <p className="text-sm text-muted-foreground">Share your code to start earning!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {referrals.map((referral, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{referral.displayName}</p>
                                <p className="text-sm text-muted-foreground">{referral.email}</p>
                                <p className="text-xs text-muted-foreground">
                                  {referral.date.toLocaleDateString()}
                                </p>
                              </div>
                              <Badge className={getReferralStatusColor(referral.status)}>
                                {referral.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 