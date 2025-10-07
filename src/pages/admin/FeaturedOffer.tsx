import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { SettingsService, FeaturedOfferConfig } from '@/services/settingsService';
import { ProductService, AdminProduct } from '@/services/productService';
import { Link } from 'react-router-dom';

const FeaturedOfferAdmin = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FeaturedOfferConfig | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [testingProductId, setTestingProductId] = useState(false);

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

  // Load products for selection
  useEffect(() => {
    const unsub = ProductService.subscribeProducts((products) => {
      setProducts(products);
      // Find the currently selected product
      if (form?.productId) {
        const product = products.find(p => p.id === form.productId);
        setSelectedProduct(product || null);
      }
    });
    return () => unsub();
  }, [form?.productId]);

  const onChange = (key: keyof FeaturedOfferConfig, value: any) => {
    if (!form) return;
    setForm({ ...form, [key]: value });
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    onChange('productId', productId);
    
    // Auto-fill price and title from selected product
    if (product) {
      onChange('price', product.price);
      if (!form?.title || form.title === 'Featured Offer') {
        onChange('title', product.name);
      }
      if (!form?.subtitle) {
        onChange('subtitle', product.description);
      }
    }
  };

  const testProductId = async () => {
    if (!form?.productId) {
      toast({ title: 'Error', description: 'Please enter a product ID first', variant: 'destructive' });
      return;
    }

    setTestingProductId(true);
    try {
      const product = await ProductService.getProductById(form.productId);
      if (product) {
        setSelectedProduct(product);
        toast({ title: 'Success', description: `Product found: ${product.name}` });
      } else {
        setSelectedProduct(null);
        toast({ title: 'Not Found', description: 'Product ID not found in database', variant: 'destructive' });
      }
    } catch (error: any) {
      setSelectedProduct(null);
      toast({ title: 'Error', description: error.message || 'Failed to test product ID', variant: 'destructive' });
    } finally {
      setTestingProductId(false);
    }
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
            <div className="mt-2">
              <Link to="/admin/products">
                <Button variant="outline" size="sm">
                  📦 Manage Products
                </Button>
              </Link>
            </div>
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
                    <label className="text-sm mb-1 block">Product ID (Manual Entry)</label>
                    <Input 
                      value={form.productId} 
                      onChange={(e) => onChange('productId', e.target.value)}
                      placeholder="Enter product ID manually..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter the exact product ID from the products collection
                    </p>
                  </div>
                  <div>
                    <label className="text-sm mb-1 block">Select Product (Dropdown)</label>
                    <Select value={form.productId} onValueChange={handleProductSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a product..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            <div className="flex items-center space-x-2">
                              <span>{product.name}</span>
                              <Badge variant="outline" className="text-xs">₹{product.price}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedProduct && (
                      <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                            {selectedProduct.image ? (
                              <img 
                                src={selectedProduct.image} 
                                alt={selectedProduct.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`text-muted-foreground text-xs ${selectedProduct.image ? 'hidden' : ''}`}>
                              IMG
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{selectedProduct.name}</p>
                            <p className="text-xs text-muted-foreground">{selectedProduct.category}</p>
                            <p className="text-xs text-muted-foreground">₹{selectedProduct.price}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm mb-1 block">Promo Code (optional)</label>
                    <Input value={form.promoCode || ''} onChange={(e) => onChange('promoCode', e.target.value)} />
                  </div>
                </div>

                {/* Product ID Validation Section */}
                <div className="mt-6 p-4 border rounded-lg bg-muted/30">
                  <h4 className="text-sm font-medium mb-2">Product ID Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Current Product ID:</span>
                      <Badge variant={form.productId ? "default" : "destructive"}>
                        {form.productId || "Not set"}
                      </Badge>
                    </div>
                    {form.productId && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Status:</span>
                        <Badge variant={selectedProduct ? "default" : "destructive"}>
                          {selectedProduct ? "Valid Product" : "Invalid/Not Found"}
                        </Badge>
                      </div>
                    )}
                    {!selectedProduct && form.productId && (
                      <p className="text-xs text-destructive">
                        ⚠️ Product ID "{form.productId}" not found in products collection. 
                        <Link to="/admin/products" className="underline ml-1">
                          Check products
                        </Link>
                      </p>
                    )}
                    {form.productId === 'products' && (
                      <p className="text-xs text-destructive">
                        ❌ Invalid Product ID: "products" is not a valid product ID. Please select a valid product or enter a correct product ID.
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={testProductId}
                        disabled={testingProductId || !form.productId}
                      >
                        {testingProductId ? 'Testing...' : '🔍 Test Product ID'}
                      </Button>
                      <Link to="/admin/products">
                        <Button variant="outline" size="sm">
                          📦 View All Products
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Preview Section */}
        {form && form.active && selectedProduct && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How the featured offer will appear on the homepage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border border-primary/30 bg-card rounded-lg p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-primary text-primary-foreground">Featured Offer</Badge>
                      {form.badgeText && (
                        <span className="text-xs text-muted-foreground">{form.badgeText}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold">{form.title}</h3>
                    {form.subtitle && (
                      <p className="text-muted-foreground mt-1">{form.subtitle}</p>
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-2xl font-bold text-primary">₹{form.price}</span>
                      {form.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">₹{form.originalPrice}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button>
                      <span className="mr-2">💳</span> Get Offer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FeaturedOfferAdmin;


