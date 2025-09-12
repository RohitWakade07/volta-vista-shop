import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Promo, PromoService } from '@/services/promoService';
import { ProductService, AdminProduct } from '@/services/productService';

const PromosAdmin = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'superadmin';

  const [items, setItems] = useState<Promo[]>([]);
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [allProducts, setAllProducts] = useState<AdminProduct[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const unsubPromos = PromoService.subscribe(setItems);
    const unsubProducts = ProductService.subscribeProducts(setAllProducts);
    return () => { unsubPromos(); unsubProducts(); };
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
      await PromoService.create(code, Number(amount), selectedIds);
      setCode(''); setAmount(''); setSelectedIds([]);
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
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input placeholder="CODE" value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
              <Input placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} />
              <Button onClick={handleCreate}>Create</Button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Applicable products (optional)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-auto border rounded p-2">
                {allProducts.map(p => {
                  const checked = selectedIds.includes(p.id);
                  return (
                    <label key={p.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedIds(prev => e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id));
                        }}
                      />
                      <span className="truncate">{p.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Promos</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {items.map(p => (
            <div key={p.id} className="flex items-start gap-4 p-3 border rounded">
              <span className="font-mono">{p.code}</span>
              <Badge variant="secondary">₹{p.amount}</Badge>
              <Badge>{p.active ? 'Active' : 'Inactive'}</Badge>
              {p.productIds && p.productIds.length > 0 && (
                <span className="text-xs text-muted-foreground">{p.productIds.length} product(s)</span>
              )}
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


