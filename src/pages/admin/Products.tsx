import { useState } from 'react';
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

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

const Products = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Arduino Uno R3",
      price: 24.99,
      originalPrice: 29.99,
      description: "Microcontroller board based on the ATmega328P with 14 digital I/O pins",
      category: "Microcontrollers",
      inStock: true,
      rating: 4.8,
      reviews: 1247,
      isFeatured: true
    },
    {
      id: "2", 
      name: "Motor Driver L298N",
      price: 8.99,
      description: "Dual H-Bridge Motor Driver for DC and Stepper Motors with 2A current capacity",
      category: "Motor Drivers",
      inStock: true,
      rating: 4.6,
      reviews: 892
    },
    {
      id: "3",
      name: "Breadboard 830 Point",
      price: 5.99,
      description: "Solderless breadboard for prototyping circuits with power rails",
      category: "Prototyping",
      inStock: true,
      rating: 4.7,
      reviews: 1563
    }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast({
      title: "Product deleted",
      description: "Product has been removed successfully.",
    });
  };

  const handleToggleStock = (productId: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, inStock: !p.inStock } : p
    ));
    toast({
      title: "Stock updated",
      description: "Product stock status has been updated.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Product Management</h1>
            <p className="text-muted-foreground">Manage your store's products</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Products</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
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
                      <span className="text-lg font-bold text-primary">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStock(product.id)}
                    >
                      {product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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