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
  Filter,
  Image,
  Check,
  Settings,
  X,
  Save
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
    images: '',
    whatsInBox: '',
    warranty: '',
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All Categories' },
    { id: 'Microcontrollers', name: 'Microcontrollers' },
    { id: 'Motor Drivers', name: 'Motor Drivers' },
    { id: 'Prototyping', name: 'Prototyping' },
    { id: 'Single Board Computers', name: 'Single Board Computers' },
    { id: 'Motors', name: 'Motors' },
    { id: 'LEDs', name: 'LEDs' },
    { id: 'Relays', name: 'Relays' }
  ]);
  
  // Available images from public folder
  const availableImages = [
    { name: 'Final.webp', url: '/Final.webp' },
    { name: 'ultron (1).png', url: '/ultron (1).png' },
    { name: 'ultron (2).png', url: '/ultron (2).png' },
    { name: 'ultron (4).png', url: '/ultron (4).png' },
    { name: 'ultron (5).png', url: '/ultron (5).png' },
    { name: 'banner.png', url: '/banner.png' },
    { name: 'placeholder.svg', url: '/placeholder.svg' },
    { name: 'favicon.ico', url: '/favicon.ico' }
  ];

  useEffect(() => {
    const unsub = ProductService.subscribeProducts(setProducts);
    return () => unsub();
  }, []);


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
        images: newProduct.images ? newProduct.images.split(',').map(url => url.trim()).filter(Boolean) : undefined,
        whatsInBox: newProduct.whatsInBox ? newProduct.whatsInBox.split(',').map(item => item.trim()).filter(Boolean) : undefined,
        warranty: newProduct.warranty.trim() || undefined,
      } as any;
      if (editId) {
        await ProductService.updateProduct(editId, payload);
      } else {
        await ProductService.addProduct(payload);
      }
      setNewProduct({ name: '', price: '', originalPrice: '', image: '', description: '', category: 'Microcontrollers', inStock: true, images: '', whatsInBox: '', warranty: '' });
      setEditId(null);
      toast({ title: 'Product added', description: 'Product has been created.' });
    } catch (e: any) {
      toast({ title: 'Failed to add', description: e.message || 'Please try again', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setNewProduct(prev => ({ ...prev, image: imageUrl }));
    setShowImageSelector(false);
    toast({
      title: "Image Selected",
      description: "Image has been set for the product",
    });
  };

  const addCategory = () => {
    if (!newCategory.trim()) {
      toast({
        title: "Invalid Category",
        description: "Please enter a category name",
        variant: "destructive"
      });
      return;
    }

    const categoryId = newCategory.trim().replace(/\s+/g, ' ').toLowerCase().replace(/\s+/g, '-');
    const categoryName = newCategory.trim().replace(/\s+/g, ' ');

    // Check if category already exists
    if (categories.find(cat => cat.id === categoryId || cat.name === categoryName)) {
      toast({
        title: "Category Exists",
        description: "A category with this name already exists",
        variant: "destructive"
      });
      return;
    }

    setCategories(prev => [...prev, { id: categoryId, name: categoryName }]);
    setNewCategory('');
    toast({
      title: "Category Added",
      description: `${categoryName} has been added to categories`,
    });
  };

  const removeCategory = (categoryId: string) => {
    if (categoryId === 'all') {
      toast({
        title: "Cannot Remove",
        description: "Cannot remove 'All Categories' option",
        variant: "destructive"
      });
      return;
    }

    // Check if any products use this category
    const productsUsingCategory = products.filter(product => product.category === categories.find(cat => cat.id === categoryId)?.name);
    if (productsUsingCategory.length > 0) {
      toast({
        title: "Cannot Remove",
        description: `Cannot remove category. ${productsUsingCategory.length} product(s) are using this category`,
        variant: "destructive"
      });
      return;
    }

    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    toast({
      title: "Category Removed",
      description: "Category has been removed successfully",
    });
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
            <Button 
              variant="outline" 
              onClick={() => setShowCategoryManager(!showCategoryManager)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Manage Categories
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              <Plus className="h-4 w-4 mr-2" />
              {editId ? 'Update Product' : (creating ? 'Creating...' : 'Add Product')}
            </Button>
            {editId && (
              <Button variant="outline" onClick={() => { setEditId(null); setNewProduct({ name: '', price: '', originalPrice: '', image: '', description: '', category: 'Microcontrollers', inStock: true, images: '', whatsInBox: '', warranty: '' }); }}>Cancel</Button>
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
                <div className="flex gap-2">
                  <Input 
                    id="np-image" 
                    value={newProduct.image} 
                    onChange={(e) => setNewProduct(p => ({ ...p, image: e.target.value }))} 
                    placeholder="https://... or select from public folder" 
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowImageSelector(!showImageSelector)}
                    className="flex items-center gap-2"
                  >
                    <Image className="h-4 w-4" />
                    Select
                  </Button>
                </div>
                
                {/* Image Preview */}
                {newProduct.image && (
                  <div className="mt-2">
                    <img 
                      src={newProduct.image} 
                      alt="Product preview" 
                      className="w-20 h-20 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* Image Selector Modal */}
                {showImageSelector && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Image className="h-5 w-5" />
                          Select Image from Public Folder
                        </CardTitle>
                        <CardDescription>
                          Choose an image from your public folder
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {availableImages.map((image) => (
                            <div
                              key={image.name}
                              className={`relative group cursor-pointer border rounded-lg overflow-hidden transition-all hover:shadow-lg ${
                                newProduct.image === image.url ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'
                              }`}
                              onClick={() => handleImageSelect(image.url)}
                            >
                              <div className="aspect-square bg-muted flex items-center justify-center">
                                <img
                                  src={image.url}
                                  alt={image.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="hidden text-muted-foreground text-xs text-center p-2">
                                  {image.name}
                                </div>
                              </div>
                              
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="flex items-center gap-2"
                                >
                                  <Check className="h-4 w-4" />
                                  Select
                                </Button>
                              </div>
                              
                              <div className="p-2 bg-background">
                                <p className="text-sm font-medium truncate">{image.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {image.url}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowImageSelector(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="np-desc">Description</Label>
                <Input id="np-desc" value={newProduct.description} onChange={(e) => setNewProduct(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="np-images">Additional Images (comma-separated URLs)</Label>
                <Input id="np-images" value={newProduct.images} onChange={(e) => setNewProduct(p => ({ ...p, images: e.target.value }))} placeholder="https://image1.jpg, https://image2.jpg" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="np-whats-in-box">What's in the Box (comma-separated items)</Label>
                <Input id="np-whats-in-box" value={newProduct.whatsInBox} onChange={(e) => setNewProduct(p => ({ ...p, whatsInBox: e.target.value }))} placeholder="Arduino Uno, USB Cable, Breadboard, Jumper Wires" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="np-warranty">Warranty</Label>
                <Input id="np-warranty" value={newProduct.warranty} onChange={(e) => setNewProduct(p => ({ ...p, warranty: e.target.value }))} placeholder="1 year manufacturer warranty" />
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
                    <Button variant="outline" size="sm" onClick={() => { 
                      setEditId(product.id); 
                      setNewProduct({ 
                        name: product.name, 
                        price: String(product.price), 
                        originalPrice: product.originalPrice ? String(product.originalPrice) : '', 
                        image: product.image, 
                        description: product.description, 
                        category: product.category, 
                        inStock: product.inStock,
                        images: product.images ? product.images.join(', ') : '',
                        whatsInBox: product.whatsInBox ? product.whatsInBox.join(', ') : '',
                        warranty: product.warranty || ''
                      }); 
                    }}>
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

        {/* Category Management Modal */}
        {showCategoryManager && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Manage Categories
                </CardTitle>
                <CardDescription>
                  Add or remove product categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Category */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Add New Category</h3>
                  <div className="flex gap-2">
                    <Input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter category name (e.g., Sensors, Power Supplies)"
                      onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                    />
                    <Button onClick={addCategory} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Current Categories */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Current Categories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{category.name}</span>
                          {category.id === 'all' && (
                            <Badge variant="secondary" className="text-xs">
                              System
                            </Badge>
                          )}
                        </div>
                        {category.id !== 'all' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCategory(category.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Usage Statistics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Category Usage</h3>
                  <div className="space-y-2">
                    {categories.filter(cat => cat.id !== 'all').map((category) => {
                      const productCount = products.filter(product => product.category === category.name).length;
                      return (
                        <div key={category.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">{category.name}</span>
                          <Badge variant={productCount > 0 ? "default" : "secondary"}>
                            {productCount} product{productCount !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCategoryManager(false)}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products; 