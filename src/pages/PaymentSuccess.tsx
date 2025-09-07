import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  ArrowLeft,
  Phone,
  Shield,
  Clock,
  Package,
  MapPin,
  User
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PaymentService } from '@/services/paymentService';
import { Order } from '@/types';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      setError('Invalid order ID');
      setLoading(false);
      return;
    }

    // Simulate fetching order details
    const fetchOrder = async () => {
      try {
        // In a real app, you would fetch the order from your backend
        // For now, we'll simulate the order data
        const mockOrder: Order = {
          id: orderId,
          userId: userProfile?.uid || '',
          items: [], // This would be populated from the actual order
          total: 0,
          status: 'processing',
          paymentStatus: 'completed',
          paymentMethod: 'phonepe',
          createdAt: new Date(),
          updatedAt: new Date(),
          shippingAddress: {
            name: userProfile?.displayName || '',
            phone: userProfile?.phone || '',
            address: userProfile?.address?.street || '',
            city: userProfile?.address?.city || '',
            state: userProfile?.address?.state || '',
            pincode: userProfile?.address?.pincode || '',
          }
        };
        
        setOrder(mockOrder);
        
        // Update order status to processing
        await PaymentService.updateOrderStatus(orderId, 'processing', 'completed');
        
        toast({
          title: "Payment Successful!",
          description: "Your order has been placed successfully.",
        });
      } catch (error: any) {
        setError(error.message || 'Failed to process order');
        toast({
          title: "Error",
          description: error.message || "Failed to process order",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, userProfile, toast]);

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-green-50/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-4 w-4 animate-spin" />
              <span>Processing your payment...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-red-50/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Payment Error</CardTitle>
            <CardDescription className="text-center">
              {error || 'Order not found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-green-50/30">
      <div className="container mx-auto p-6 max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">Your order has been placed successfully</p>
        </div>

        {/* Success Card */}
        <Card className="mb-6 border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-green-800">PhonePe Payment</CardTitle>
                <CardDescription className="text-green-600">Order #{order.id}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Details */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-700">Order ID:</span>
                <span className="font-mono text-sm text-green-800">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Payment Status:</span>
                <Badge className="bg-green-600 text-white">Completed</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Payment Method:</span>
                <Badge variant="secondary">PhonePe</Badge>
              </div>
            </div>

            {/* Security Notice */}
            <Alert className="border-green-200 bg-green-100">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your payment has been processed securely through PhonePe.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Order Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Customer</span>
                </h4>
                <p className="text-sm text-muted-foreground">{order.shippingAddress.name}</p>
                <p className="text-sm text-muted-foreground">{order.shippingAddress.phone}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Delivery Address</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Order Status:</span>
                <Badge variant="outline" className="capitalize">{order.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <p className="font-medium">Order Confirmation</p>
                <p className="text-sm text-muted-foreground">You'll receive an email confirmation shortly</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <div>
                <p className="font-medium">Processing</p>
                <p className="text-sm text-muted-foreground">We'll prepare your order for shipment</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <div>
                <p className="font-medium">Tracking</p>
                <p className="text-sm text-muted-foreground">You'll receive tracking information once shipped</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleViewOrders} className="flex-1">
            View My Orders
          </Button>
          <Button variant="outline" onClick={handleContinueShopping} className="flex-1">
            Continue Shopping
          </Button>
        </div>

        {/* Support Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Contact us at{' '}
            <a href="mailto:ultron.inov@gmail.com" className="text-primary hover:underline">
              ultron.inov@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
