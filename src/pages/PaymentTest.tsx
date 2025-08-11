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
      
      setPaymentStatus('success');
      
      toast({
        title: "Payment Successful!",
        description: "Your order has been placed successfully.",
      });

      // Redirect to home page after 3 seconds
      setTimeout(() => {
        navigate('/');
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">PhonePe Payment</h1>
            <p className="text-muted-foreground">Complete your payment securely</p>
          </div>

          {/* Payment Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>PhonePe Payment</CardTitle>
                  <CardDescription>Order #{orderId}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Details */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-mono text-sm">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-bold">₹{(parseFloat(amount) * 83).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <Badge variant="secondary">PhonePe</Badge>
                </div>
              </div>

              {/* Security Notice */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
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
                      className="w-full"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay ₹{(parseFloat(amount) * 83).toFixed(2)}
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handlePaymentFailure}
                      disabled={loading}
                      className="w-full"
                    >
                      Cancel Payment
                    </Button>
                  </div>
                </div>
              )}

              {paymentStatus === 'processing' && (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing payment...</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we process your payment securely.
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
                    <Button onClick={() => navigate('/')} className="w-full">
                      Continue Shopping
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
                    <Button onClick={handleBackToCheckout} className="w-full">
                      Try Again
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                      Back to Home
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Mode Notice */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-yellow-800">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium">Test Mode</span>
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                This is a test payment interface. No real money will be charged.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentTest; 