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
  const [formData, setFormData] = useState({
    name: userProfile?.displayName || '',
    phone: userProfile?.phone || '',
    address: userProfile?.address?.street || '',
    city: userProfile?.address?.city || '',
    state: userProfile?.address?.state || '',
    pincode: userProfile?.address?.pincode || '',
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

  const computeDiscount = (items: CartItem[], codeRaw: string) => {
    const code = (codeRaw || '').trim().toUpperCase();
    try {
      PromoService.findByCode(code).then(p => {
        if (!p) { setDiscount(0); return; }
        const applicableSet = new Set(p.productIds || []);
        const applicableTotal = (p.productIds && p.productIds.length > 0)
          ? items.filter(i => applicableSet.has(i.id)).reduce((s, i) => s + i.price * i.quantity, 0)
          : items.reduce((s, i) => s + i.price * i.quantity, 0);
        setDiscount(Math.min(applicableTotal, p.amount));
      });
    } catch { setDiscount(0); }
    return discount;
  };

  useEffect(() => {
    setDiscount(computeDiscount(cartItems, promoCode));
  }, [cartItems, promoCode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (!formData.address.trim()) return 'Address is required';
    if (!formData.city.trim()) return 'City is required';
    if (!formData.state.trim()) return 'State is required';
    if (!formData.pincode.trim()) return 'Pincode is required';
    if (cartItems.length === 0) return 'Cart is empty';
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
      // Create order
      const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: userProfile?.uid || '',
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        total,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'phonepe',
        promoCode: promoCode.trim().toUpperCase() || undefined,
        discount,
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        }
      };

      const orderId = await PaymentService.createOrder(orderData);
      // Clear cart storage now that an order exists
      try { localStorage.removeItem('vv_cart'); } catch {}
      
      // Request a PhonePe payment URL from backend then redirect
      const isProdHost = window.location.hostname.endsWith('ultroninov.in');
      const base = isProdHost ? '' : 'https://ultroninov.in';
      const resp = await fetch(`${base}/phonepe/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amountPaise: Math.round(total * 100),
          userId: orderData.userId,
          mobileNumber: orderData.shippingAddress.phone,
          // Always use production domain for PhonePe redirect/callback
          redirectBaseUrl: 'https://ultroninov.in',
        })
      });
      let data: any = null;
      try {
        const ct = resp.headers.get('content-type') || '';
        data = ct.includes('application/json') ? await resp.json() : null;
      } catch {}
      if (!resp.ok || !data?.url) {
        const msg = data?.message || data?.error || `Failed (${resp.status})`;
        throw new Error(`Unable to start payment. ${msg}`);
      }
      window.location.href = data.url;

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
                <CardDescription>Enter your delivery details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="Pincode"
                    />
                  </div>
                </div>
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