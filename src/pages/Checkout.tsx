import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ShoppingCart, 
  CreditCard, 
  Phone, 
  MapPin, 
  User, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PaymentService } from '@/services/paymentService';
import { PromoService } from '@/services/promoService';
import { Order, CartItem } from '@/types';

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  
  // Form state
  const [studentData, setStudentData] = useState({
    name: userProfile?.displayName || '',
    branchDiv: '',
    phone: userProfile?.phone || '',
    campus: '' as '' | 'Bibwewadi' | 'Kondhwa',
  });

  // Load cart items dynamically from localStorage (populated by product pages)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('vv_cart');
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        setCartItems(parsed);
      }
      const storedPromo = localStorage.getItem('vv_promo');
      if (storedPromo) {
        setPromoCode(storedPromo);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0; // Shipping disabled for now
  const total = Math.max(0, subtotal + shipping - discount);

  const computeDiscount = async (items: CartItem[], codeRaw: string) => {
    const code = (codeRaw || '').trim().toUpperCase();
    if (!code) {
      setDiscount(0);
      return 0;
    }
    
    try {
      const promo = await PromoService.findByCode(code);
      if (!promo) { 
        setDiscount(0); 
        return 0; 
      }
      
      const applicableSet = new Set(promo.productIds || []);
      const applicableTotal = (promo.productIds && promo.productIds.length > 0)
        ? items.filter(i => applicableSet.has(i.id)).reduce((s, i) => s + i.price * i.quantity, 0)
        : items.reduce((s, i) => s + i.price * i.quantity, 0);
      
      const newDiscount = Math.min(applicableTotal, promo.amount);
      setDiscount(newDiscount);
      return newDiscount;
    } catch (error) {
      console.error('Error computing discount:', error);
      setDiscount(0);
      return 0;
    }
  };

  useEffect(() => {
    computeDiscount(cartItems, promoCode);
  }, [cartItems, promoCode]);


  const validateForm = () => {
    if (cartItems.length === 0) return 'Cart is empty';
    if (!studentData.name.trim()) return 'Student name is required';
    if (!studentData.branchDiv.trim()) return 'Branch/Div is required';
    if (!studentData.phone.trim()) return 'Student phone is required';
    if (!studentData.campus) return 'Select a campus';
    return null;
  };

  const handleProceedToPay = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setPaymentLoading(true);

    try {
      // Ensure discount is valid even if promo validation failed
      const finalDiscount = Math.max(0, discount || 0);
      const finalTotal = Math.max(0, subtotal + shipping - finalDiscount);
      
      // Create order
      const orderBase: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: userProfile?.uid || '',
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        total: finalTotal,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'phonepe',
        discount: finalDiscount,
        shippingAddress: {
          name: studentData.name,
          phone: studentData.phone,
          address: `${studentData.campus} Campus Pickup`,
          city: studentData.campus || '',
          state: '',
          pincode: '',
        }
      };

      // Add promoCode only if it's not empty
      if (promoCode.trim()) {
        orderBase.promoCode = promoCode.trim().toUpperCase();
      }

      const orderData = {
        ...orderBase,
        student: {
          name: studentData.name,
          branchDiv: studentData.branchDiv,
          phone: studentData.phone,
          campus: studentData.campus,
        }
      } as any;

      const orderId = await PaymentService.createOrder(orderData);
      // Clear cart storage now that an order exists
      try { localStorage.removeItem('vv_cart'); } catch {}
      
      // Navigate to simple QR payments page
      navigate(`/payments-qr?orderId=${encodeURIComponent(orderId)}&amount=${encodeURIComponent(finalTotal.toFixed(0))}`);

    } catch (error: any) {
      setError(error.message || 'Failed to process payment');
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleBackToCart = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" onClick={handleBackToCart}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>
          <p className="text-muted-foreground">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Your cart is empty. <Button variant="link" onClick={() => navigate('/')}>Continue shopping</Button></div>
                ) : cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4" />
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

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{shipping.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 p-4 border rounded-lg bg-primary/5">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                  <div>
                    <p className="font-medium">PhonePe</p>
                    <p className="text-sm text-muted-foreground">Pay securely with PhonePe</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto">Recommended</Badge>
                </div>

                {/* Promo Code */}
                <div className="mt-4 space-y-2">
                  <Label htmlFor="promo">Promo Code</Label>
                  <div className="flex gap-2">
                    <Input id="promo" value={promoCode} onChange={(e) => {
                      setPromoCode(e.target.value);
                      try { localStorage.setItem('vv_promo', e.target.value); } catch {}
                    }} placeholder="Enter promo code" />
                    <Button type="button" onClick={() => setPromoCode(promoCode.trim().toUpperCase())}>Apply</Button>
                  </div>
                  {discount > 0 && (
                    <p className="text-sm text-green-600">Discount applied: ₹{discount.toFixed(0)}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shipping Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Shipping Information</span>
                </CardTitle>
                <CardDescription>Enter your student details for campus pickup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 p-4 border rounded-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sname">Student Name</Label>
                      <Input id="sname" value={studentData.name} onChange={(e) => setStudentData(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter student name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sphone">Student Phone</Label>
                      <Input id="sphone" value={studentData.phone} onChange={(e) => setStudentData(prev => ({ ...prev, phone: e.target.value }))} placeholder="Enter phone number" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sbranch">Branch / Div</Label>
                      <Input id="sbranch" value={studentData.branchDiv} onChange={(e) => setStudentData(prev => ({ ...prev, branchDiv: e.target.value }))} placeholder="e.g. E&TC Div B" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scampus" className="text-black">Campus</Label>
                      <select id="scampus" className="border rounded-md h-10 px-3 text-black" value={studentData.campus} onChange={(e) => setStudentData(prev => ({ ...prev, campus: e.target.value as any }))}>
                        <option value="">Select campus</option>
                        <option value="Bibwewadi">Bibwewadi</option>
                        <option value="Kondhwa">Kondhwa</option>
                      </select>
                    </div>
                  </div>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

              </CardContent>
            </Card>

            {/* Proceed to Payment */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  onClick={handleProceedToPay}
                  disabled={paymentLoading}
                  className="w-full"
                  size="lg"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceed to Pay ₹{total.toFixed(0)}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  You will be redirected to PhonePe for secure payment
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 