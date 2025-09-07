import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ArrowLeft,
  Phone,
  Shield,
  Clock
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PaymentService } from '@/services/paymentService';

const PaymentTest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (!orderId || !amount) {
      setError('Invalid payment parameters');
      return;
    }
  }, [orderId, amount]);

  const handlePaymentSuccess = async () => {
    if (!orderId) return;
    
    setLoading(true);
    setPaymentStatus('processing');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update order status
      await PaymentService.processPaymentSuccess(orderId, `TXN_${Date.now()}`);
      try { localStorage.removeItem('vv_cart'); } catch {}
      
      setPaymentStatus('success');
      
      toast({
        title: "Payment Successful!",
        description: "Your order has been placed successfully.",
      });

      // Redirect to order details after 3 seconds
      setTimeout(() => {
        navigate(`/orders/${orderId}`);
      }, 3000);

    } catch (error: any) {
      setPaymentStatus('failed');
      setError(error.message || 'Payment failed');
      toast({
        title: "Payment Failed",
        description: error.message || "Payment could not be processed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFailure = () => {
    setPaymentStatus('failed');
    setError('Payment was cancelled or failed');
  };

  const handleBackToCheckout = () => {
    navigate('/checkout');
  };

  if (!orderId || !amount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Invalid Payment</CardTitle>
            <CardDescription className="text-center">
              Payment parameters are missing or invalid.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBackToCheckout} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Checkout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-purple-50/30">
      <div className="container mx-auto p-6">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-purple-800">PhonePe</h1>
            </div>
            <p className="text-muted-foreground">Complete your payment securely</p>
          </div>

          {/* Payment Card */}
          <Card className="mb-6 border-purple-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">PhonePe Payment</CardTitle>
                  <CardDescription className="text-purple-100">Order #{orderId}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Details */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono text-sm font-medium">{orderId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-lg text-purple-600">₹{Number(amount).toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Method:</span>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">PhonePe</Badge>
                </div>
              </div>

              {/* Security Notice */}
              <Alert className="border-green-200 bg-green-50">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  This is a secure payment gateway. Your payment information is encrypted and secure.
                </AlertDescription>
              </Alert>

              {/* Payment Status */}
              {paymentStatus === 'pending' && (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Ready to process payment</span>
                  </div>
                  <div className="space-y-3">
                    <Button 
                      onClick={handlePaymentSuccess}
                      disabled={loading}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Phone className="h-4 w-4 mr-2" />
                          Pay ₹{Number(amount).toFixed(0)} with PhonePe
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handlePaymentFailure}
                      disabled={loading}
                      className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Cancel Payment
                    </Button>
                  </div>
                </div>
              )}

              {paymentStatus === 'processing' && (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-purple-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing payment...</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we process your payment securely through PhonePe.
                  </p>
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Payment Successful!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your order has been placed successfully. You will receive a confirmation email shortly.
                  </p>
                  <div className="pt-4">
                    <Button 
                      onClick={() => navigate(`/payment/success?orderId=${orderId}`)} 
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      View Order Details
                    </Button>
                  </div>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    <span className="font-semibold">Payment Failed</span>
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-3">
                    <Button 
                      onClick={handleBackToCheckout} 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Try Again
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/')} 
                      className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Back to Home
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Mode Notice */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-purple-800">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium">PhonePe Test Mode</span>
              </div>
              <p className="text-sm text-purple-700 mt-2">
                This is a test payment interface using PhonePe sandbox. No real money will be charged.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentTest; 