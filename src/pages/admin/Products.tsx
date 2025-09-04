import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package,
  Search,
  Filter
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ProductService, AdminProduct } from '@/services/productService';

const Products = () => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [creating, setCreating] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    originalPrice: '',
    image: '',
    description: '',
    category: 'Microcontrollers',
    inStock: true,
  });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = ProductService.subscribeProducts(setProducts);
    return () => unsub();
  }, []);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'Microcontrollers', name: 'Microcontrollers' },
    { id: 'Motor Drivers', name: 'Motor Drivers' },
    { id: 'Prototyping', name: 'Prototyping' },
    { id: 'Single Board Computers', name: 'Single Board Computers' },
    { id: 'Motors', name: 'Motors' },
    { id: 'LEDs', name: 'LEDs' },
    { id: 'Relays', name: 'Relays' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProduct = async (productId: string) => {
    await ProductService.deleteProduct(productId);
    toast({ title: 'Product deleted', description: 'Product has been removed successfully.' });
  };

  const handleToggleStock = async (productId: string, current: boolean) => {
    await ProductService.updateProduct(productId, { inStock: !current });
    toast({ title: 'Stock updated', description: 'Product stock status has been updated.' });
  };

  const handleCreate = async () => {
    if (!newProduct.name.trim() || !newProduct.price) {
      toast({ title: 'Missing fields', description: 'Name and price are required.' });
      return;
    }
    setCreating(true);
    try {
      const payload = {
        name: newProduct.name.trim(),
        price: Number(newProduct.price),
        originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : undefined,
        image: newProduct.image || 'https://via.placeholder.com/400x300',
        description: newProduct.description.trim() || '—',
        category: newProduct.category,
        inStock: true,
        rating: 0,
        reviews: 0,
        isNew: true,
        isFeatured: false,
      } as any;
      if (editId) {
        await ProductService.updateProduct(editId, payload);
      } else {
        await ProductService.addProduct(payload);
      }
      setNewProduct({ name: '', price: '', originalPrice: '', image: '', description: '', category: 'Microcontrollers', inStock: true });
      setEditId(null);
      toast({ title: 'Product added', description: 'Product has been created.' });
    } catch (e: any) {
      toast({ title: 'Failed to add', description: e.message || 'Please try again', variant: 'destructive' });
    } finally {
      setCreating(false);
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Product Management</h1>
            <p className="text-muted-foreground">Manage your store's products</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={creating}>
              <Plus className="h-4 w-4 mr-2" />
              {editId ? 'Update Product' : (creating ? 'Creating...' : 'Add Product')}
            </Button>
            {editId && (
              <Button variant="outline" onClick={() => { setEditId(null); setNewProduct({ name: '', price: '', originalPrice: '', image: '', description: '', category: 'Microcontrollers', inStock: true }); }}>Cancel</Button>
            )}
          </div>
        </div>

        {/* Create + Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="np-name">Name</Label>
                <Input id="np-name" value={newProduct.name} onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="np-category">Category</Label>
                <select id="np-category" value={newProduct.category} onChange={(e) => setNewProduct(p => ({ ...p, category: e.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {categories.filter(c => c.id !== 'all').map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <Label htmlFor="np-price">Price (₹)</Label>
                <Input id="np-price" type="number" value={newProduct.price} onChange={(e) => setNewProduct(p => ({ ...p, price: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="np-op">Original Price (₹)</Label>
                <Input id="np-op" type="number" value={newProduct.originalPrice} onChange={(e) => setNewProduct(p => ({ ...p, originalPrice: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="np-image">Image URL</Label>
                <Input id="np-image" value={newProduct.image} onChange={(e) => setNewProduct(p => ({ ...p, image: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="np-desc">Description</Label>
                <Input id="np-desc" value={newProduct.description} onChange={(e) => setNewProduct(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>

            <CardTitle className="mt-6 mb-2">Filters</CardTitle>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Products</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="search" placeholder="Search by name or description..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="category">Category</Label>
                <select id="category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <div className="grid gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      {product.isNew && (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                          NEW
                        </Badge>
                      )}
                      {product.isFeatured && (
                        <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
                          FEATURED
                        </Badge>
                      )}
                      <Badge variant={product.inStock ? "default" : "secondary"}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Category: {product.category}</span>
                      <span>Rating: {product.rating}/5 ({product.reviews} reviews)</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-lg font-bold text-primary">₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStock(product.id, product.inStock)}
                    >
                      {product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setEditId(product.id); setNewProduct({ name: product.name, price: String(product.price), originalPrice: product.originalPrice ? String(product.originalPrice) : '', image: product.image, description: product.description, category: product.category, inStock: product.inStock }); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant={product.isFeatured ? 'default' : 'outline'} size="sm" onClick={() => ProductService.updateProduct(product.id, { isFeatured: !product.isFeatured })}>
                      {product.isFeatured ? 'Featured' : 'Mark Featured'}
                    </Button>
                    <Button variant={product.originalPrice ? 'default' : 'outline'} size="sm" onClick={() => ProductService.updateProduct(product.id, { originalPrice: product.originalPrice ? undefined : Math.round(product.price * 1.2) })}>
                      {product.originalPrice ? 'Clear Sale' : 'Add Sale'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first product.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Products; 