import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Minus, Plus, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  inStock?: boolean;
}

const Cart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('vv_cart');
      if (stored) setCart(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('vv_cart', JSON.stringify(cart));
  }, [cart]);

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.id !== id));
      return;
    }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const getTotal = () => cart.reduce((t, i) => t + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h1 className="text-2xl font-semibold">Your Cart</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>Continue Shopping</Button>
        </div>

        {cart.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button className="mt-4" onClick={() => navigate('/')}>Browse Products</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="w-14 h-14 bg-muted rounded-md flex items-center justify-center">
                      <div className="text-xs text-muted-foreground">IMG</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Items</span>
                  <Badge variant="secondary">{cart.reduce((t, i) => t + i.quantity, 0)}</Badge>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{getTotal().toFixed(0)}</span>
                </div>
                <Button className="w-full" onClick={() => navigate('/checkout')}>
                  <CreditCard className="h-4 w-4 mr-2" /> Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;


