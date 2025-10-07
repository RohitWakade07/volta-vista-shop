import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
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
  CheckCircle,
  X,
  Trash2,
  DollarSign,
  AlertTriangle,
  Edit,
  Save
} from 'lucide-react';

const OrdersAdmin = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'completed' | 'failed' | 'refunded' | 'advance50'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [editingDuePayment, setEditingDuePayment] = useState<{ [key: string]: boolean }>({});
  const [duePaymentAmounts, setDuePaymentAmounts] = useState<{ [key: string]: string }>({});

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
    setLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      await PaymentService.updateOrderStatus(orderId, status);
      toast({
        title: "Status Updated",
        description: `Order ${orderId} status updated to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: Order['paymentStatus']) => {
    setLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      await PaymentService.updateOrderStatus(orderId, 'processing', paymentStatus);
      toast({
        title: "Payment Status Updated",
        description: `Order ${orderId} payment status updated to ${paymentStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const updateDuePayment = async (orderId: string) => {
    const newAmount = parseFloat(duePaymentAmounts[orderId]);
    if (isNaN(newAmount) || newAmount < 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      await PaymentService.updateDuePayment(orderId, newAmount);
      toast({
        title: "Due Payment Updated",
        description: `Due payment for order ${orderId} updated to ₹${newAmount.toFixed(0)}`,
      });
      setEditingDuePayment(prev => ({ ...prev, [orderId]: false }));
      setDuePaymentAmounts(prev => ({ ...prev, [orderId]: '' }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update due payment",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const startEditingDuePayment = (orderId: string, currentAmount: number) => {
    setEditingDuePayment(prev => ({ ...prev, [orderId]: true }));
    setDuePaymentAmounts(prev => ({ ...prev, [orderId]: currentAmount.toString() }));
  };

  const cancelEditingDuePayment = (orderId: string) => {
    setEditingDuePayment(prev => ({ ...prev, [orderId]: false }));
    setDuePaymentAmounts(prev => ({ ...prev, [orderId]: '' }));
  };

  const markRemainingPaymentReceived = async (orderId: string) => {
    setLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      await PaymentService.markRemainingPaymentReceived(orderId);
      toast({
        title: "Remaining Payment Received",
        description: `Order ${orderId} remaining payment has been marked as received`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark remaining payment received",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const cancelOrder = async (orderId: string) => {
    setLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      await PaymentService.cancelOrder(orderId);
      toast({
        title: "Order Cancelled",
        description: `Order ${orderId} has been cancelled`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const deleteOrder = async (orderId: string) => {
    setLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      await PaymentService.deleteOrder(orderId);
      toast({
        title: "Order Deleted",
        description: `Order ${orderId} has been permanently deleted`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [orderId]: false }));
    }
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const res = await PaymentService.fixIncorrectlyBackfilledData();
                  toast({ title: 'Data Fix Complete', description: `Fixed ${res.fixed} orders that were incorrectly backfilled.` });
                } catch (e: any) {
                  toast({ title: 'Data Fix Failed', description: e?.message || 'Unknown error', variant: 'destructive' });
                }
              }}
            >
              Fix Backfilled Data
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Payment</p>
                  <p className="text-2xl font-bold">{orders.filter(o => o.paymentStatus === 'pending').length}</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                  <p className="text-2xl font-bold">{orders.filter(o => o.status === 'processing').length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold">{orders.filter(o => o.status === 'delivered').length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Input 
            placeholder="Search by ID or name" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-64"
          />                                               
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>      
            <SelectTrigger className="w-44"><SelectValue placeholder="Order Status" /></SelectTrigger>                                                                
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={(v: any) => setPaymentFilter(v)}>      
            <SelectTrigger className="w-44"><SelectValue placeholder="Payment Status" /></SelectTrigger>                                                                
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="pending">Pending Payment</SelectItem>
              <SelectItem value="completed">Payment Received</SelectItem>
              <SelectItem value="failed">Payment Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="advance50">Advance 50%</SelectItem>
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
              .filter(o => {
                if (paymentFilter === 'all') return true;
                if (paymentFilter === 'advance50') return !!o.partialPayment?.enabled;
                return o.paymentStatus === paymentFilter;
              })
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
                          {order.partialPayment?.enabled && (
                            <>
                              <Badge className="bg-purple-100 text-purple-800">ADVANCE 50%</Badge>
                              {order.partialPayment?.remainingPaymentReceived && (
                                <Badge className="bg-green-100 text-green-800">FULL PAYMENT</Badge>
                              )}
                            </>
                          )}
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
                          {order.transactionId && (
                            <span className="flex items-center space-x-1">
                              <span className="font-mono text-[10px]">TXN: {order.transactionId}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {order.partialPayment?.enabled ? (
                          <>
                            <div className="text-2xl font-bold text-green-600">₹{(order.partialPayment.paidNow || 0).toFixed(0)}</div>
                            <div className="text-xs text-muted-foreground">Paid now • Due ₹{(order.partialPayment.dueOnDelivery || 0).toFixed(0)} of ₹{order.total.toFixed(0)}</div>
                            <div className="text-sm text-muted-foreground">{order.items.length} items</div>
                            
                            {/* Due Payment Update Controls */}
                            <div className="mt-2 flex items-center space-x-2">
                              {editingDuePayment[order.id] ? (
                                <>
                                  <div className="flex items-center space-x-1">
                                    <Label htmlFor={`due-${order.id}`} className="text-xs">Due:</Label>
                                    <Input
                                      id={`due-${order.id}`}
                                      type="number"
                                      min="0"
                                      value={duePaymentAmounts[order.id] || ''}
                                      onChange={(e) => setDuePaymentAmounts(prev => ({ ...prev, [order.id]: e.target.value }))}
                                      className="w-20 h-6 text-xs"
                                      placeholder="0"
                                    />
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2"
                                    onClick={() => updateDuePayment(order.id)}
                                    disabled={loading[order.id]}
                                  >
                                    <Save className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2"
                                    onClick={() => cancelEditingDuePayment(order.id)}
                                    disabled={loading[order.id]}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => startEditingDuePayment(order.id, order.partialPayment?.dueOnDelivery || 0)}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit Due
                                  </Button>
                                  
                                  {/* Mark Remaining Payment Received Button */}
                                  {order.partialPayment?.dueOnDelivery > 0 && !order.partialPayment?.remainingPaymentReceived && (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
                                      onClick={() => markRemainingPaymentReceived(order.id)}
                                      disabled={loading[order.id]}
                                    >
                                      <DollarSign className="h-3 w-3 mr-1" />
                                      Payment Received
                                    </Button>
                                  )}
                                  
                                  {/* Show if remaining payment was received */}
                                  {order.partialPayment?.remainingPaymentReceived && (
                                    <div className="flex items-center space-x-1 text-xs text-green-600">
                                      <CheckCircle className="h-3 w-3" />
                                      <span>Full Payment Complete</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-2xl font-bold text-green-600">₹{order.total.toFixed(0)}</div>
                            <div className="text-sm text-muted-foreground">{order.items.length} items</div>
                          </>
                        )}
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
                      <div className="flex items-center space-x-2 flex-wrap">
                        {/* Order Status Buttons */}
                        {order.status !== 'processing' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateStatus(order.id, 'processing')}
                            disabled={loading[order.id]}
                          >                                               
                            <Package className="h-3 w-3 mr-1" />
                            {loading[order.id] ? 'Updating...' : 'Processing'}
                          </Button>
                        )}
                        {order.status !== 'shipped' && order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateStatus(order.id, 'shipped')}
                            disabled={loading[order.id]}
                          >                                                  
                            <Truck className="h-3 w-3 mr-1" />
                            {loading[order.id] ? 'Updating...' : 'Shipped'}
                          </Button>
                        )}
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateStatus(order.id, 'delivered')}
                            disabled={loading[order.id]}
                          >                                                                  
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {loading[order.id] ? 'Updating...' : 'Delivered'}
                          </Button>
                        )}
                        
                        {/* Payment Status Buttons */}
                        {order.paymentStatus === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updatePaymentStatus(order.id, 'completed')}
                            disabled={loading[order.id]}
                            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          >
                            <DollarSign className="h-3 w-3 mr-1" />
                            {loading[order.id] ? 'Updating...' : 'Payment Received'}
                          </Button>
                        )}
                        
                        {/* Cancel Order */}
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={loading[order.id]}
                                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel order {order.id}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => cancelOrder(order.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Cancel Order
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        
                        {/* Delete Order */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              disabled={loading[order.id]}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                Delete Order Permanently
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to permanently delete order {order.id}? This action cannot be undone and will remove all order data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Order</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteOrder(order.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Permanently
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </div>
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

        {/* Order Details Modal */}
        <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details - {selectedOrder?.id}
              </DialogTitle>
              <DialogDescription>
                Complete order information and customer details
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Status and Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Order Status
                    </h3>
                    <Badge variant={selectedOrder.status === 'delivered' ? 'default' : 'secondary'}>
                      {selectedOrder.status.toUpperCase()}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Created: {selectedOrder.createdAt.toLocaleDateString()} at {selectedOrder.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment Status
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={selectedOrder.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                        {selectedOrder.paymentStatus.toUpperCase()}
                      </Badge>
                      {selectedOrder.partialPayment?.enabled && (
                        <>
                          <Badge className="bg-purple-100 text-purple-800">ADVANCE 50%</Badge>
                          {selectedOrder.partialPayment?.remainingPaymentReceived && (
                            <Badge className="bg-green-100 text-green-800">FULL PAYMENT</Badge>
                          )}
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Method: {selectedOrder.paymentMethod.toUpperCase()}
                    </p>
                    {selectedOrder.partialPayment?.remainingPaymentReceived && selectedOrder.partialPayment?.remainingPaymentReceivedAt && (
                      <p className="text-xs text-green-600">
                        Full payment completed: {new Date(selectedOrder.partialPayment.remainingPaymentReceivedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p><strong>Name:</strong> {selectedOrder.shippingAddress.name}</p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <strong>Phone:</strong> {selectedOrder.shippingAddress.phone}
                      </p>
                      <p><strong>Email:</strong> {selectedOrder.shippingAddress.email || 'Not provided'}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Delivery Address
                      </h4>
                      <div className="text-sm">
                        <p>{selectedOrder.shippingAddress.address}</p>
                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                        <p>PIN: {selectedOrder.shippingAddress.pincode}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student Information (if provided) */}
                {selectedOrder.student && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Student Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 text-sm">
                          <p><strong>Name:</strong> {selectedOrder.student.name}</p>
                          <p><strong>Phone:</strong> {selectedOrder.shippingAddress.phone}</p>
                          <p><strong>College:</strong> {selectedOrder.student.college || selectedOrder.student.collegeName || 'N/A'}</p>
                          <p><strong>Campus:</strong> {selectedOrder.student.campus}</p>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p><strong>Branch:</strong> {selectedOrder.student.branch || 'N/A'}</p>
                          <p><strong>Division:</strong> {selectedOrder.student.branchDiv || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Order Items */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Items ({selectedOrder.items.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{item.price.toFixed(0)}</p>
                          <p className="text-sm text-muted-foreground">Total: ₹{(item.price * item.quantity).toFixed(0)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{selectedOrder.total.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>Free</span>
                    </div>
                    {selectedOrder.promoCode && (
                      <div className="flex justify-between">
                        <span>Promo Code:</span>
                        <span className="font-mono text-xs">{selectedOrder.promoCode}</span>
                      </div>
                    )}
                    {selectedOrder.discount && selectedOrder.discount > 0 && (
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span className="text-green-600">-₹{selectedOrder.discount.toFixed(0)}</span>
                      </div>
                    )}
                    {selectedOrder.partialPayment?.enabled && (
                      <>
                        <div className="flex justify-between">
                          <span>Paid Now (50%):</span>
                          <span className="text-green-600">₹{(selectedOrder.partialPayment.paidNow || 0).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Due on Delivery:</span>
                          <span className="text-orange-600">₹{(selectedOrder.partialPayment.dueOnDelivery || 0).toFixed(0)}</span>
                        </div>
                      </>
                    )}
                    {selectedOrder.transactionId && (
                      <div className="flex justify-between">
                        <span>Transaction ID:</span>
                        <span className="font-mono text-xs">{selectedOrder.transactionId}</span>
                      </div>
                    )}
                    {selectedOrder.gatewayOrderId && (
                      <div className="flex justify-between">
                        <span>Gateway Order ID:</span>
                        <span className="font-mono text-xs">{selectedOrder.gatewayOrderId}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>₹{selectedOrder.total.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                {/* Order Notes */}
                {selectedOrder.notes && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="font-semibold">Order Notes</h3>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OrdersAdmin;


