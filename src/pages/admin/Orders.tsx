import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { PaymentService } from '@/services/paymentService';
import { Order } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Package, 
  User, 
  MapPin, 
  Phone, 
  CreditCard, 
  Calendar,
  Eye,
  Truck,
  CheckCircle
} from 'lucide-react';

const OrdersAdmin = () => {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [search, setSearch] = useState('');

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'superadmin';
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md"><CardHeader><CardTitle className="text-center">Access Denied</CardTitle></CardHeader></Card>
      </div>
    );
  }

  useEffect(() => {
    const unsub = PaymentService.subscribeAllOrders((os) => setOrders(os));
    return () => unsub();
  }, []);

  // For this simplified version, we'll allow manual search/filter on existing `orders` if provided via another route

  const updateStatus = async (orderId: string, status: Order['status']) => {
    await PaymentService.updateOrderStatus(orderId, status);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground">Review and update order statuses</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Input placeholder="Search by ID or name" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Orders ({orders.length})</span>
            </CardTitle>
            <CardDescription>Manage and track order deliveries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {orders
              .filter(o => filter === 'all' || o.status === filter)
              .filter(o => !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.items.some(i => i.name.toLowerCase().includes(search.toLowerCase())))
              .map(order => (
                <Card key={order.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{order.id}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.toUpperCase()}
                          </Badge>
                          <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                            {order.paymentStatus.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <CreditCard className="h-3 w-3" />
                            <span>{order.paymentMethod.toUpperCase()}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">₹{order.total.toFixed(0)}</div>
                        <div className="text-sm text-muted-foreground">{order.items.length} items</div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Customer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Customer Details</span>
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Name:</strong> {order.shippingAddress.name}</p>
                          <p className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span><strong>Phone:</strong> {order.shippingAddress.phone}</span>
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>Delivery Address</span>
                        </h4>
                        <div className="text-sm">
                          <p>{order.shippingAddress.address}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3 mb-4">
                      <h4 className="font-medium">Order Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                <Package className="h-4 w-4 text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">₹{(item.price * item.quantity).toFixed(0)}</p>
                              <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Promo Code & Discount */}
                    {order.promoCode && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Promo Code: {order.promoCode}</span>
                          {order.discount && order.discount > 0 && (
                            <span className="text-sm text-green-600">-₹{order.discount.toFixed(0)} discount</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => updateStatus(order.id, 'processing')}>
                          <Package className="h-3 w-3 mr-1" />
                          Processing
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => updateStatus(order.id, 'shipped')}>
                          <Truck className="h-3 w-3 mr-1" />
                          Shipped
                        </Button>
                        <Button size="sm" onClick={() => updateStatus(order.id, 'delivered')}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Delivered
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            
            {orders.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders found</h3>
                <p className="text-muted-foreground">Orders will appear here once customers place them.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrdersAdmin;


