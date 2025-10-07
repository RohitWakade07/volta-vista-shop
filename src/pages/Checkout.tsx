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
  AlertCircle,
  Plus,
  Minus
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
  const [payMode, setPayMode] = useState<'full' | 'half'>('full');
  const [currentPromo, setCurrentPromo] = useState<{ paymentOptions: 'full' | 'partial' | 'both' } | null>(null);
  
  // Form state
  const [studentData, setStudentData] = useState({
    name: userProfile?.displayName || '',
    branchDiv: '',
    branch: '' as string,
    collegeName: '' as string,
    college: '' as string,
    phone: userProfile?.phone || '',
    campus: '' as string,
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
  const canPartialPay = cartItems.length > 0 && cartItems.every(i => !!i.allowPartialPayment);
  const halfNow = Math.floor(total / 2);
  const dueLater = Math.max(0, total - halfNow);
  
  // Check if promo code restricts payment options
  const isPromoFullPaymentOnly = currentPromo?.paymentOptions === 'full';
  const showPartialPaymentOption = canPartialPay && !isPromoFullPaymentOnly;

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      const updatedCart = cartItems.filter(item => item.id !== id);
      setCartItems(updatedCart);
      try { localStorage.setItem('vv_cart', JSON.stringify(updatedCart)); } catch {}
      return;
    }
    
    const updatedCart = cartItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    );
    setCartItems(updatedCart);
    try { localStorage.setItem('vv_cart', JSON.stringify(updatedCart)); } catch {}
  };

  const computeDiscount = async (items: CartItem[], codeRaw: string) => {
    const code = (codeRaw || '').trim().toUpperCase();
    if (!code) {
      setDiscount(0);
      setCurrentPromo(null);
      return 0;
    }
    
    try {
      const promo = await PromoService.findByCode(code);
      if (!promo) { 
        setDiscount(0);
        setCurrentPromo(null);
        return 0; 
      }
      
      // Store promo payment options
      setCurrentPromo({ paymentOptions: promo.paymentOptions });
      
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
      setCurrentPromo(null);
      return 0;
    }
  };

  useEffect(() => {
    computeDiscount(cartItems, promoCode);
  }, [cartItems, promoCode]);

  // Auto-set payment mode to 'full' when promo requires full payment only
  useEffect(() => {
    if (isPromoFullPaymentOnly && payMode === 'half') {
      setPayMode('full');
    }
  }, [isPromoFullPaymentOnly, payMode]);


  const validateForm = () => {
    if (cartItems.length === 0) return 'Cart is empty';
    if (!studentData.name.trim()) return 'Student name is required';
    if (studentData.college === 'Other') {
      if (!studentData.collegeName.trim()) return 'College name is required';
    } else if (!studentData.college) {
      return 'Please select a college';
    }
    if (!studentData.branch.trim()) return 'Branch is required';
    if (!studentData.branchDiv.trim()) return 'Division is required';
    if (!studentData.phone.trim()) return 'Student phone is required';
    if ((studentData.college === 'VIT Pune' || studentData.college === 'BITS' || studentData.college === 'BIT Mesra') && !studentData.campus) return 'Select a campus';
    return null;
  };

  const loadRazorpayScript = () => new Promise<boolean>((resolve) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

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
        paymentMethod: 'razorpay',
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

      const chargeAmount = (canPartialPay && payMode === 'half') ? Math.max(0, Math.floor(finalTotal / 2)) : finalTotal;

      const orderData = {
        ...orderBase,
        student: {
          name: studentData.name,
          branchDiv: studentData.branchDiv,
          branch: studentData.branch,
          collegeName: studentData.college === 'Other' ? studentData.collegeName : studentData.college,
          college: studentData.college || (studentData.collegeName ? 'Other' : ''),
          phone: studentData.phone,
          campus: studentData.campus,
        },
        ...(canPartialPay && payMode === 'half' ? {
          partialPayment: {
            enabled: true,
            paidNow: chargeAmount,
            dueOnDelivery: Math.max(0, finalTotal - chargeAmount),
          }
        } : {})
      } as any;

      const orderId = await PaymentService.createOrder(orderData);
      // Create Razorpay order on server
      const { order, key } = await PaymentService.createRazorpayOrder(orderId, chargeAmount);

      // Load Razorpay SDK
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error('Failed to load Razorpay');

      const options: any = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'Volta Vista Shop',
        description: `Order ${orderId}`,
        order_id: order.id,
        notes: { orderId },
        handler: async function (response: any) {
          let verifiedOk = false;
          try {
            const verify = await PaymentService.verifyRazorpaySignature({
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            verifiedOk = !!verify.verified;
          } catch (e: any) {
            // swallow to ensure redirect
          } finally {
            try { localStorage.removeItem('vv_cart'); } catch {}
            navigate(`/payment/success?orderId=${encodeURIComponent(orderId)}`);
          }
        },
        theme: { color: '#7c3aed' },
        modal: {
          ondismiss: function () {
            setError('Payment cancelled');
          }
        },
        prefill: {
          name: studentData.name,
          contact: studentData.phone,
        }
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();

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
                        <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-8 w-8" 
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-8 w-8" 
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="font-medium">₹{(item.price * item.quantity).toFixed(0)}</p>
                      </div>
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

            {/* Payment Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Options</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showPartialPaymentOption && (
                  <div className="mb-4">
                    <Label className="mb-2 block">Choose how to pay</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={payMode === 'full' ? 'default' : 'outline'}
                        onClick={() => setPayMode('full')}
                      >
                        Pay Full ₹{total.toFixed(0)}
                      </Button>
                      <Button
                        type="button"
                        variant={payMode === 'half' ? 'default' : 'outline'}
                        onClick={() => setPayMode('half')}
                      >
                        Pay 50% Now ₹{halfNow.toFixed(0)} (Due ₹{dueLater.toFixed(0)})
                      </Button>
                    </div>
                  </div>
                )}
                
                {isPromoFullPaymentOnly && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> This promo code requires full payment only. Partial payment option is not available.
                    </p>
                  </div>
                )}

                {/* Promo Code */}
                <div className="space-y-2">
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
                      <Label htmlFor="collegeSelect">College</Label>
                      <select id="collegeSelect" className="border rounded-md h-10 px-3 text-black" value={studentData.college} onChange={(e) => setStudentData(prev => ({ ...prev, college: e.target.value as any, campus: '', branch: '' }))}>
                        <option value="Other">Other</option>
                        <option value="VIT Pune">VIT Pune</option>
                        <option value="K. K. Wagh College of Engineering Nashik">K. K. Wagh College of Engineering Nashik</option>
                        <option value="Sandip UniversityNashik">Sandip University Nashik</option>
                        <option value="VIT Vellore">VIT Vellore</option>
                        <option value="BITS">BITS (Birla Institute of Technology & Science)</option>
                        <option value="BIT Mesra">BIT Mesra (Birla Institute of Technology)</option>
                        <option value="COEP">COEP</option>
                        <option value="PICT">PICT</option>
                        <option value="VJTI">VJTI</option>
                        <option value="SPPU">SPPU</option>
                        <option value="Sinhgad">Sinhgad College of Engineering</option>
                        <option value="AIT Pune">AIT Pune</option>
                        <option value="MIT WPU">MIT WPU</option>
                        <option value="DY Patil Pune">DY Patil COE Pune</option>
                        <option value="PCCOE">PCCOE</option>
                        <option value="BVDU">BVDU</option>
                        <option value="KJ Somaiya">KJ Somaiya COE</option>
                        <option value="DJ Sanghvi">DJ Sanghvi COE</option>
                        <option value="VIT Mumbai">VIT Mumbai</option>
                        <option value="Sandip University Nashik">Sandip University Nashik</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="college">College Name</Label>
                      <Input id="college" value={studentData.collegeName} onChange={(e) => setStudentData(prev => ({ ...prev, collegeName: e.target.value }))} placeholder="Enter college name (required for 'Other')" disabled={studentData.college !== 'Other'} />
                    </div>
                  </div>
                  {studentData.college === 'VIT Pune' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="scampus" className="text-black">Campus</Label>
                        <select id="scampus" className="border rounded-md h-10 px-3 text-black" value={studentData.campus} onChange={(e) => setStudentData(prev => ({ ...prev, campus: e.target.value as any, branch: '' }))}>
                          <option value="">Select campus</option>
                          <option value="Bibwewadi">Bibwewadi</option>
                          <option value="Kondhwa">Kondhwa</option>
                        </select>
                      </div>
                    </div>
                  )}
                  {studentData.college === 'BITS' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="scampus" className="text-black">Campus</Label>
                        <select id="scampus" className="border rounded-md h-10 px-3 text-black" value={studentData.campus} onChange={(e) => setStudentData(prev => ({ ...prev, campus: e.target.value as any, branch: '' }))}>
                          <option value="">Select campus</option>
                          <option value="Pilani">Pilani</option>
                          <option value="Goa">Goa</option>
                          <option value="Hyderabad">Hyderabad</option>
                          <option value="Dubai">Dubai</option>
                        </select>
                      </div>
                    </div>
                  )}
                  {studentData.college === 'BIT Mesra' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="scampus" className="text-black">Campus</Label>
                        <select id="scampus" className="border rounded-md h-10 px-3 text-black" value={studentData.campus} onChange={(e) => setStudentData(prev => ({ ...prev, campus: e.target.value as any, branch: '' }))}>
                          <option value="">Select campus</option>
                          <option value="Mesra">Mesra</option>
                          <option value="Patna">Patna</option>
                          <option value="Deoghar">Deoghar</option>
                          <option value="Jaipur">Jaipur</option>
                          <option value="Noida">Noida</option>
                          <option value="Lalpur">Lalpur (Ranchi)</option>
                        </select>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="branch">Branch</Label>
                      <select id="branch" className="border rounded-md h-10 px-3 text-black" value={studentData.branch} onChange={(e) => setStudentData(prev => ({ ...prev, branch: e.target.value }))} disabled={studentData.college === 'VIT Pune' ? !studentData.campus : false}>
                        <option value="">Select branch</option>
                        {studentData.college === 'VIT Pune' && studentData.campus === 'Kondhwa' && (
                          <>
                            <option value="ENTC">ENTC</option>
                            <option value="Mech">Mech</option>
                            <option value="DS">DS</option>
                            <option value="SE">SE</option>
                            <option value="IoT">IoT</option>
                            <option value="Civil">Civil</option>
                          </>
                        )}
                        {studentData.college === 'VIT Pune' && studentData.campus === 'Bibwewadi' && (
                          <>
                            <option value="Computer Engineering">Computer Engineering</option>
                            <option value="IT">IT</option>
                            <option value="AIML">AIML</option>
                            <option value="AI">AI</option>
                            <option value="AIDS">AIDS</option>
                          </>
                        )}
                        {studentData.college !== 'VIT Pune' && (
                          <>
                            <option value="Computer Engineering">Computer Engineering</option>
                            <option value="IT">IT</option>
                            <option value="ENTC">ENTC</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Civil">Civil</option>
                            <option value="AIML">AIML</option>
                            <option value="AI">AI</option>
                            <option value="AIDS">AIDS</option>
                            <option value="IoT">IoT</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Software Engineering">Software Engineering</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="division">Division</Label>
                      <select id="division" className="border rounded-md h-10 px-3 text-black" value={studentData.branchDiv} onChange={(e) => setStudentData(prev => ({ ...prev, branchDiv: e.target.value }))}>
                        <option value="">Select division</option>
                        {Array.from({ length: 12 }).map((_, idx) => {
                          const c = String.fromCharCode('A'.charCodeAt(0) + idx);
                          return (
                            <option key={c} value={`Div ${c}`}>{`Div ${c}`}</option>
                          );
                        })}
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
                      {canPartialPay && payMode === 'half' 
                        ? `Pay Now ₹${halfNow.toFixed(0)} (Due ₹${dueLater.toFixed(0)})`
                        : `Proceed to Pay ₹${total.toFixed(0)}`}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Secure payment powered by Razorpay
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