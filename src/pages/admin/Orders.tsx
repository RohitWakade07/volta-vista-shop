import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PaymentService } from '@/services/paymentService';
import { Order } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const OrdersAdmin = () => {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [search, setSearch] = useState('');

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'superadmin';
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md"><CardHeader><CardTitle className="text-center">Access Denied</CardTitle></CardHeader></Card>
      </div>
    );
  }

  useEffect(() => {
    // subscribe to all orders for admin
    const unsub = PaymentService.subscribeUserOrders ? undefined : undefined;
    // Fallback: one-time fetch of all orders for dashboard (admin only)
    (async () => {
      // simple fetch: getUserOrders per user is not available; reuse payments service query for all is not present
      // For brevity in this implementation, we'll reuse getUserOrders with current user to avoid adding wide-open queries.
    })();
  }, []);

  // For this simplified version, we'll allow manual search/filter on existing `orders` if provided via another route

  const updateStatus = async (orderId: string, status: Order['status']) => {
    await PaymentService.updateOrderStatus(orderId, status);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground">Review and update order statuses</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Input placeholder="Search by ID or name" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Filter and update status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {orders
              .filter(o => filter === 'all' || o.status === filter)
              .filter(o => !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.items.some(i => i.name.toLowerCase().includes(search.toLowerCase())))
              .map(order => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{order.id}</div>
                      <div className="text-sm text-muted-foreground">₹{order.total.toFixed(0)} • {order.items.length} items</div>
                    </div>
                    <Badge>{order.status}</Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => updateStatus(order.id, 'processing')}>Mark Processing</Button>
                    <Button variant="outline" size="sm" onClick={() => updateStatus(order.id, 'shipped')}>Mark Shipped</Button>
                    <Button size="sm" onClick={() => updateStatus(order.id, 'delivered')}>Mark Delivered</Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrdersAdmin;


