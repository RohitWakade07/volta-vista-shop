import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const ref = doc(db, 'orders', id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError('Order not found');
          return;
        }
        const data = snap.data() as any;
        const normalized: Order = {
          id: snap.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        };
        setOrder(normalized);
      } catch (e: any) {
        setError(e.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const totalItems = (o: Order) => o.items.reduce((t, i) => t + i.quantity, 0);
  const subtotal = (o: Order) => o.items.reduce((t, i) => t + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h1 className="text-2xl font-semibold">Order Details</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>Continue Shopping</Button>
        </div>

        {loading && (
          <Card><CardContent className="py-10 text-center text-muted-foreground">Loading order...</CardContent></Card>
        )}

        {error && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Unable to load order</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/')}>Back to Home</Button>
            </CardContent>
          </Card>
        )}

        {order && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order #{order.id}</CardTitle>
                <CardDescription>
                  Placed on {order.createdAt.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  {order.paymentStatus === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : order.paymentStatus === 'pending' ? (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <Badge variant="secondary">{order.paymentStatus.toUpperCase()}</Badge>
                  <Badge>{order.status.toUpperCase()}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {order.shippingAddress.name}, {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Items ({totalItems(order)})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between border-b border-border pb-3">
                    <div className="truncate">
                      <div className="font-medium truncate">{it.name}</div>
                      <div className="text-xs text-muted-foreground">Qty: {it.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₹{(it.price * it.quantity).toFixed(0)}</div>
                      <div className="text-xs text-muted-foreground">₹{it.price} each</div>
                    </div>
                  </div>
                ))}
                <div className="pt-2 space-y-1">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal(order).toFixed(0)}</span></div>
                  {order.discount ? (
                    <div className="flex justify-between text-green-600"><span>Discount{order.promoCode ? ` (${order.promoCode})` : ''}</span><span>-₹{order.discount.toFixed(0)}</span></div>
                  ) : null}
                  <div className="flex justify-between"><span>Shipping</span><span>₹0</span></div>
                  <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>₹{order.total.toFixed(0)}</span></div>
                </div>
                <div className="pt-4">
                  <Button onClick={() => navigate('/')}>Back to Home</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;


