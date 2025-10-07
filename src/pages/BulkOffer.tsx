import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ShoppingCart, MessageCircle, Package, Users, Truck, Shield, Zap, CheckCircle, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ProductService } from '@/services/productService';
import { Product } from '@/types';

const BulkOffer = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<{[key: string]: number}>({});
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');

  // Load products
  useEffect(() => {
    setLoading(true);
    const unsub = ProductService.subscribeProducts((items: any[]) => {
      setProducts(items as Product[]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Calculate total quantity
  useEffect(() => {
    const total = Object.values(selectedProducts).reduce((sum, qty) => sum + qty, 0);
    setTotalQuantity(total);
  }, [selectedProducts]);

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      const newSelected = { ...selectedProducts };
      delete newSelected[productId];
      setSelectedProducts(newSelected);
    } else {
      setSelectedProducts(prev => ({
        ...prev,
        [productId]: quantity
      }));
    }
  };

  const getTotalPrice = () => {
    return Object.entries(selectedProducts).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const handleWhatsAppRedirect = () => {
    const selectedItems = Object.entries(selectedProducts)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return product ? `${product.name} x${quantity}` : '';
      })
      .filter(Boolean);

    const message = `Hi! I want to buy 10+ kits. Here are the items I'm interested in:

${selectedItems.join('\n')}

Total Quantity: ${totalQuantity} kits
Estimated Total: ₹${getTotalPrice()}

${customerMessage ? `Additional Message: ${customerMessage}` : ''}

Please let me know the bulk pricing for these items.`;

    const whatsappUrl = `https://wa.me/919156294374?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleWebsiteOrder = () => {
    if (!currentUser) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to place an order.",
        variant: "destructive"
      });
      return;
    }

    // Add selected products to cart
    const cartItems = Object.entries(selectedProducts).map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return product ? { ...product, quantity } : null;
    }).filter(Boolean);

    try {
      localStorage.setItem('vv_cart', JSON.stringify(cartItems));
      navigate('/checkout');
      toast({ 
        title: "Added to cart", 
        description: "Your bulk order has been added to cart. Proceeding to checkout." 
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add items to cart. Please try again.",
        variant: "destructive"
      });
    }
  };

  const canOrderOnWebsite = totalQuantity >= 5 && totalQuantity <= 9;
  const shouldRedirectToWhatsApp = totalQuantity >= 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <img 
                src={theme === 'dark' ? "/ultron (5).png" : "/ultron (4).png"} 
                alt="Ultron Logo" 
                className="h-8 w-8"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text">
                  Bulk Offer
                </h1>
                <p className="text-xs text-muted-foreground">Special pricing for bulk orders</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-4 bg-primary text-primary-foreground text-sm px-4 py-2">
              <Package className="h-4 w-4 mr-2" />
              Bulk Order Special
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text">
              Get Better Prices on Bulk Orders
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Order 5-9 kits directly from our website, or contact us for 10+ kits to get special bulk pricing.
            </p>
            
            {/* Order Type Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <ShoppingCart className="h-5 w-5" />
                    Website Order (5-9 kits)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-600 dark:text-green-400">
                    Order directly from our website with instant checkout and payment processing.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp Order (10+ kits)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-600 dark:text-blue-400">
                    Contact us for special bulk pricing and custom quotes for large orders.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Product Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Select Products for Bulk Order
                </CardTitle>
                <CardDescription>
                  Choose the products and quantities for your bulk order
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <div className="aspect-video bg-muted rounded-t-lg" />
                        <CardHeader>
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </CardHeader>
                        <CardContent>
                          <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                          <div className="h-8 bg-muted rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.filter(p => p.inStock).map((product) => (
                      <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                        <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-t-lg flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-muted-foreground text-sm">Product Image</div>
                          )}
                        </div>
                        
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                          <CardDescription className="text-sm line-clamp-2">{product.description}</CardDescription>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xl font-bold text-primary">₹{product.price}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{product.originalPrice}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(product.id, (selectedProducts[product.id] || 0) - 1)}
                              disabled={!selectedProducts[product.id]}
                            >
                              -
                            </Button>
                            <span className="w-12 text-center">
                              {selectedProducts[product.id] || 0}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(product.id, (selectedProducts[product.id] || 0) + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalQuantity === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No items selected</p>
                    <p className="text-sm text-muted-foreground mt-2">Add products to your bulk order</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {Object.entries(selectedProducts).map(([productId, quantity]) => {
                        const product = products.find(p => p.id === productId);
                        if (!product) return null;
                        return (
                          <div key={productId} className="flex justify-between items-center text-sm">
                            <span className="truncate">{product.name} x{quantity}</span>
                            <span className="font-medium">₹{product.price * quantity}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">Total Quantity:</span>
                        <span className="font-bold text-primary">{totalQuantity} kits</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Estimated Total:</span>
                        <span className="text-xl font-bold text-primary">₹{getTotalPrice()}</span>
                      </div>
                    </div>

                    {/* Order Type Indicator */}
                    <div className="mt-4 p-3 rounded-lg border">
                      {canOrderOnWebsite && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Can order on website</span>
                        </div>
                      )}
                      {shouldRedirectToWhatsApp && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Contact for bulk pricing</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Details */}
            {totalQuantity > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Details</CardTitle>
                  <CardDescription>Optional: Provide your details for better service</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Your Name (Optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <Input
                    placeholder="Your Phone (Optional)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                  <Textarea
                    placeholder="Any special requirements or questions? (Optional)"
                    value={customerMessage}
                    onChange={(e) => setCustomerMessage(e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            {totalQuantity > 0 && (
              <div className="space-y-3">
                {canOrderOnWebsite && (
                  <Button 
                    onClick={handleWebsiteOrder}
                    className="w-full"
                    size="lg"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Order on Website (₹{getTotalPrice()})
                  </Button>
                )}
                
                {shouldRedirectToWhatsApp && (
                  <Button 
                    onClick={handleWhatsAppRedirect}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact for Bulk Pricing
                  </Button>
                )}
                
                <Button 
                  onClick={() => {
                    setSelectedProducts({});
                    setCustomerName('');
                    setCustomerPhone('');
                    setCustomerMessage('');
                  }}
                  variant="ghost"
                  className="w-full"
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-16">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Why Choose Our Bulk Orders?</CardTitle>
              <CardDescription>Get the best value for your money with our bulk order benefits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Bulk Discounts</h3>
                  <p className="text-sm text-muted-foreground">
                    Special pricing for orders of 10+ kits with additional discounts
                  </p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Free Shipping</h3>
                  <p className="text-sm text-muted-foreground">
                    Free shipping on all bulk orders above ₹5000
                  </p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Quality Guarantee</h3>
                  <p className="text-sm text-muted-foreground">
                    All products come with quality guarantee and warranty
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BulkOffer;


