import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { SettingsService, FeaturedOfferConfig } from '@/services/settingsService';

const FeaturedOfferAdmin = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FeaturedOfferConfig | null>(null);

  useEffect(() => {
    const unsub = SettingsService.subscribeFeaturedOffer((cfg) => {
      setForm(
        cfg || {
          active: false,
          title: 'Featured Offer',
          subtitle: '',
          price: 0,
          originalPrice: null,
          badgeText: 'Limited time',
          productId: '',
          promoCode: '',
          updatedAt: Date.now(),
        }
      );
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const onChange = (key: keyof FeaturedOfferConfig, value: any) => {
    if (!form) return;
    setForm({ ...form, [key]: value });
  };

  const onSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const { updatedAt, ...rest } = form;
      await SettingsService.upsertFeaturedOffer(rest as Omit<FeaturedOfferConfig, 'updatedAt'>);
      toast({ title: 'Saved', description: 'Featured offer updated.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (userProfile?.role !== 'admin' && userProfile?.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">You don't have permission to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Featured Offer</h1>
            <p className="text-muted-foreground">Configure the homepage featured offer</p>
          </div>
          <Button onClick={onSave} disabled={saving || !form}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Offer Details</CardTitle>
            <CardDescription>Control visibility and content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading || !form ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Button
                    variant={form.active ? 'default' : 'outline'}
                    onClick={() => onChange('active', !form.active)}
                  >
                    {form.active ? 'Active' : 'Inactive'}
                  </Button>
                  {form.active && (
                    <Badge className="bg-primary text-primary-foreground">Visible on Home</Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm mb-1 block">Title</label>
                    <Input value={form.title} onChange={(e) => onChange('title', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm mb-1 block">Subtitle</label>
                    <Input value={form.subtitle} onChange={(e) => onChange('subtitle', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm mb-1 block">Price (₹)</label>
                    <Input type="number" value={form.price} onChange={(e) => onChange('price', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-sm mb-1 block">Original Price (₹)</label>
                    <Input type="number" value={form.originalPrice || ''} onChange={(e) => onChange('originalPrice', e.target.value ? Number(e.target.value) : null)} />
                  </div>
                  <div>
                    <label className="text-sm mb-1 block">Badge Text</label>
                    <Input value={form.badgeText || ''} onChange={(e) => onChange('badgeText', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm mb-1 block">Product ID</label>
                    <Input placeholder="e.g. 13" value={form.productId} onChange={(e) => onChange('productId', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm mb-1 block">Promo Code (optional)</label>
                    <Input value={form.promoCode || ''} onChange={(e) => onChange('promoCode', e.target.value)} />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeaturedOfferAdmin;


