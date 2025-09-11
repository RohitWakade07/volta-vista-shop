import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Promo, PromoService } from '@/services/promoService';

const PromosAdmin = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'superadmin';

  const [items, setItems] = useState<Promo[]>([]);
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsub = PromoService.subscribe(setItems);
    return () => unsub();
  }, []);

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card><CardContent className="p-6">You need admin privileges to access this page.</CardContent></Card>
      </div>
    );
  }

  const handleCreate = async () => {
    setError('');
    try {
      await PromoService.create(code, Number(amount));
      setCode(''); setAmount('');
    } catch (e: any) {
      setError(e?.message || 'Failed');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Promo Codes</h1>
        <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>Back</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Create Promo</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex gap-2">
            <Input placeholder="CODE" value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
            <Input placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} />
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Promos</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {items.map(p => (
            <div key={p.id} className="flex items-center gap-4 p-3 border rounded">
              <span className="font-mono">{p.code}</span>
              <Badge variant="secondary">₹{p.amount}</Badge>
              <Badge>{p.active ? 'Active' : 'Inactive'}</Badge>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" onClick={() => PromoService.toggleActive(p.id, !p.active)}>
                  {p.active ? 'Disable' : 'Enable'}
                </Button>
                <Button variant="destructive" onClick={() => PromoService.remove(p.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default PromosAdmin;


