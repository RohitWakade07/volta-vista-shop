
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Plus, Minus, Search, Star, Truck, Shield, Zap, Heart, Grid, List, Menu, X, User, LogOut, CreditCard, Mail, Phone, Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  category: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

const Index = () => {
  console.log('Index component rendering...'); // Debug log
  
  // Test if basic React is working
  const [testState, setTestState] = useState('Loading...');
  
  useEffect(() => {
    console.log('Index useEffect running...'); // Debug log
    setTestState('React is working!');
  }, []);
  
  const { toast } = useToast();
  const { currentUser, userProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Debug logging for authentication
  useEffect(() => {
    console.log('Current user:', currentUser);
    console.log('User profile:', userProfile);
  }, [currentUser, userProfile]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  // Load products from Firebase (mock data for now)
  useEffect(() => {
    console.log('Index useEffect running...'); // Debug log
    const loadProducts = async () => {
      try {
        // Simulate loading from Firebase
        setTimeout(() => {
          const mockProducts: Product[] = [
            {
              id: "1",
              name: "Arduino Uno R3",
              price: 899, // 3x higher than Robu.in price (~₹300)
              originalPrice: 1099,
              image: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400&h=300&fit=crop&crop=center&q=80",
              description: "Microcontroller board based on the ATmega328P with 14 digital I/O pins, perfect for beginners and advanced projects",
              category: "Microcontrollers",
              inStock: true,
              rating: 4.8,
              reviews: 1247,
              isFeatured: true
            },
            {
              id: "2", 
              name: "Motor Driver L298N",
              price: 299, // 3x higher than Robu.in price (~₹100)
              image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&crop=center&q=80",
              description: "Dual H-Bridge Motor Driver for DC and Stepper Motors with 2A current capacity, ideal for robotics projects",
              category: "Motor Drivers",
              inStock: true,
              rating: 4.6,
              reviews: 892
            },
            {
              id: "3",
              name: "Breadboard 830 Point",
              price: 199, // 3x higher than Robu.in price (~₹70)
              image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&crop=center&q=80",
              description: "Solderless breadboard for prototyping circuits with power rails, essential for electronics prototyping",
              category: "Prototyping",
              inStock: true,
              rating: 4.7,
              reviews: 1563
            },
            {
              id: "4",
              name: "Raspberry Pi 4B 8GB",
              price: 8999, // 3x higher than Robu.in price (~₹3000)
              originalPrice: 10999,
              image: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400&h=300&fit=crop&crop=center&q=80",
              description: "Single-board computer with ARM Cortex-A72 processor and 8GB RAM, perfect for IoT and computing projects",
              category: "Single Board Computers",
              inStock: false,
              rating: 4.9,
              reviews: 2341,
              isNew: true
            },
            {
              id: "5",
              name: "Servo Motor SG90",
              price: 149, // 3x higher than Robu.in price (~₹50)
              image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&crop=center&q=80",
              description: "Micro servo motor for robotics projects with 180° rotation, perfect for automation and robotics",
              category: "Motors",
              inStock: true,
              rating: 4.5,
              reviews: 678
            },
            {
              id: "6",
              name: "ESP32 DevKit V1",
              price: 449, // 3x higher than Robu.in price (~₹150)
              image: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400&h=300&fit=crop&crop=center&q=80",
              description: "WiFi and Bluetooth enabled microcontroller with dual-core processor, ideal for IoT applications",
              category: "Microcontrollers", 
              inStock: true,
              rating: 4.7,
              reviews: 945,
              isFeatured: true
            },
            {
              id: "7",
              name: "LED Strip WS2812B",
              price: 399, // 3x higher than Robu.in price (~₹130)
              image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&crop=center&q=80",
              description: "Addressable RGB LED strip with 30 LEDs per meter, perfect for lighting projects and displays",
              category: "LEDs",
              inStock: true,
              rating: 4.4,
              reviews: 523
            },
            {
              id: "8",
              name: "Relay Module 5V",
              price: 249, // 3x higher than Robu.in price (~₹80)
              image: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400&h=300&fit=crop&crop=center&q=80",
              description: "5V relay module for switching high voltage devices, essential for home automation projects",
              category: "Relays",
              inStock: true,
              rating: 4.3,
              reviews: 456
            },
            {
              id: "9",
              name: "Arduino Nano",
              price: 599, // 3x higher than Robu.in price (~₹200)
              image: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400&h=300&fit=crop&crop=center&q=80",
              description: "Compact Arduino board based on ATmega328P, perfect for space-constrained projects",
              category: "Microcontrollers",
              inStock: true,
              rating: 4.6,
              reviews: 789
            },
            {
              id: "10",
              name: "Stepper Motor 28BYJ-48",
              price: 349, // 3x higher than Robu.in price (~₹120)
              image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&crop=center&q=80",
              description: "28BYJ-48 stepper motor with ULN2003 driver, ideal for precise positioning applications",
              category: "Motors",
              inStock: true,
              rating: 4.4,
              reviews: 634
            },
            {
              id: "11",
              name: "Jumper Wires Set",
              price: 179, // 3x higher than Robu.in price (~₹60)
              image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&crop=center&q=80",
              description: "40-piece jumper wire set with male-to-male, male-to-female, and female-to-female connectors",
              category: "Prototyping",
              inStock: true,
              rating: 4.8,
              reviews: 1123
            },
            {
              id: "12",
              name: "NodeMCU ESP8266",
              price: 399, // 3x higher than Robu.in price (~₹130)
              image: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400&h=300&fit=crop&crop=center&q=80",
              description: "WiFi-enabled microcontroller based on ESP8266, perfect for IoT and home automation projects",
              category: "Microcontrollers",
              inStock: true,
              rating: 4.7,
              reviews: 856,
              isNew: true
            }
          ];
          setProducts(mockProducts);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load products.');
        console.error(err);
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error Loading Page</CardTitle>
            <CardDescription className="text-center">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full">
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const buyNow = (product: Product) => {
    if (!currentUser) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to proceed with payment.",
        variant: "destructive"
      });
      return;
    }
    
    // Add to cart and redirect to checkout
    addToCart(product);
    navigate('/checkout');
    
    toast({
      title: "Proceeding to checkout",
      description: `Redirecting to payment for ${product.name}`,
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text">
                  Ultron
                </h1>
                <p className="text-xs text-muted-foreground">Electronic Components & Kits</p>
              </div>
            </div>
            
            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="hidden sm:flex"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <Link to="/profile">
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      {userProfile?.displayName || currentUser?.email || 'Profile'}
                    </Button>
                  </Link>
                  {userProfile?.role === 'admin' && (
                    <Link to="/admin/dashboard">
                      <Button variant="outline" size="sm">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/auth/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth/register">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
              
              {/* Cart Button */}
              <Button
                variant="outline"
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-primary">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
          
          {/* Mobile Search Bar and Theme Toggle */}
          <div className="md:hidden mt-4 space-y-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text">
            Build Your Next Project
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover premium electronic components, development kits, and tools for makers, 
            engineers, and hobbyists. Quality parts for quality projects.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Truck className="h-4 w-4" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Quality Guaranteed</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>Fast Delivery</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Products Section */}
          <div className="flex-1">
            {/* Filters and Controls */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background text-sm"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex items-center space-x-1 border border-border rounded-md">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="h-8 w-8 p-0"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-8 w-8 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} products found
                </p>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-video bg-muted rounded-t-lg" />
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                      <div className="space-y-2">
                        <div className="h-8 bg-muted rounded" />
                        <div className="h-8 bg-muted rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50 overflow-hidden">
                    <div className="relative">
                      <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-t-lg flex items-center justify-center">
                        <div className="text-muted-foreground text-sm">Product Image</div>
                      </div>
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
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
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="secondary" className="h-8 w-8">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="secondary" className="text-white bg-red-500">
                            Out of Stock
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                        <Badge variant={product.inStock ? "default" : "secondary"}>
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm line-clamp-2">{product.description}</CardDescription>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                      
                      {/* Rating */}
                      <div className="flex items-center space-x-1 mt-2">
                        {renderStars(product.rating)}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({product.reviews})
                        </span>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => addToCart(product)}
                          disabled={!product.inStock}
                          variant="outline"
                          className="flex-1"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                        
                        <Button
                          onClick={() => buyNow(product)}
                          disabled={!product.inStock}
                          className="flex-1"
                        >
                          Buy Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          {isCartOpen && (
            <div className="w-full lg:w-80 bg-card border border-border rounded-lg p-6 h-fit lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Shopping Cart</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCartOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground mt-2">Add some components to get started!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-4 max-h-96 overflow-y-auto scrollbar-hide">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 border-b border-border pb-3">
                        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                          <div className="text-xs text-muted-foreground">IMG</div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">₹{item.price}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-7 w-7"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-7 w-7"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-border pt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total:</span>
                      <span className="text-xl font-bold text-primary">₹{getTotalPrice().toFixed(0)}</span>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => {
                        if (!currentUser) {
                          toast({
                            title: "Please sign in",
                            description: "You need to be signed in to proceed with payment.",
                            variant: "destructive"
                          });
                          return;
                        }
                        navigate('/checkout');
                        setIsCartOpen(false);
                      }}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceed to Pay
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setIsCartOpen(false)}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer with Contact Information */}
      <footer className="bg-muted/50 border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Ultron</h3>
              <p className="text-sm text-muted-foreground">
                Premium electronic components, development kits, and tools for makers, 
                engineers, and hobbyists.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:ultron.inov@gmail.com" className="hover:text-primary transition-colors">
                    ultron.inov@gmail.com
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+919156294374" className="hover:text-primary transition-colors">
                    +91 9156294374
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+919307719509" className="hover:text-primary transition-colors">
                    +91 9307719509
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+917517769211" className="hover:text-primary transition-colors">
                    +91 7517769211
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <div><a href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</a></div>
                <div><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Products</a></div>
                <div><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Support</a></div>
                <div><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Stay updated with our latest products and offers.
              </p>
              <div className="flex space-x-2">
                <Input placeholder="Enter your email" className="text-sm" />
                <Button size="sm">Subscribe</Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Ultron. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
