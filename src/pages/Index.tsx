
import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Plus, Minus, Search, Truck, Shield, Zap, Heart, Grid, List, User, LogOut, CreditCard, Mail, Phone, Moon, Sun, ZoomIn, Package, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ProductService } from '@/services/productService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Product } from '@/types';
import { SettingsService, FeaturedOfferConfig } from '@/services/settingsService';

interface CartItem extends Product {
  quantity: number;
}

const Index = () => {
  
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [featuredOffer, setFeaturedOffer] = useState<FeaturedOfferConfig | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageForView, setSelectedImageForView] = useState<{url: string, alt: string} | null>(null);



  const categories = [
    { id: 'all', name: 'All Categories' },
    
  ];

  // Load products from Firebase (mock data for now)
  useEffect(() => {
    setLoading(true);
    const unsub = ProductService.subscribeProducts((items: any[]) => {
      setProducts(items as Product[]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Build recommended keywords from products
  useEffect(() => {
    const stopwords = new Set([
      'the','and','for','with','your','from','you','kit','set','tool','board','module','this','that','are','our','new','best','high','low','via','into','out','over','under','onto','to','in','on','of','by','at','is','a','an','or','as','be','it','its','it\'s','we','us','they','them','their','your','yours','his','her','hers','was','were','will','can','may','not','no','yes'
    ]);
    const counts = new Map<string, number>();
    const addWord = (w: string) => {
      const word = w.toLowerCase().replace(/[^a-z0-9+#.]/g, '');
      if (!word || word.length < 3 || stopwords.has(word)) return;
      counts.set(word, (counts.get(word) || 0) + 1);
    };
    products.forEach(p => {
      (p.name || '').split(/\s+/).forEach(addWord);
      (p.description || '').split(/\s+/).forEach(addWord);
      addWord(p.category || '');
    });
    const top = Array.from(counts.entries())
      .sort((a,b) => b[1]-a[1])
      .map(([w]) => w)
      .slice(0, 20);
    setKeywords(top);
  }, [products]);

  // Suggestions update as user types
  useEffect(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) {
      setSuggestions(keywords.slice(0, 8));
      return;
    }
    const filtered = keywords.filter(k => k.includes(q)).slice(0, 8);
    setSuggestions(filtered);
  }, [searchQuery, keywords]);

  // Close suggestions on outside click / Escape
  const desktopSearchRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        desktopSearchRef.current && !desktopSearchRef.current.contains(t) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(t)
      ) {
        setSuggestionsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSuggestionsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  // Subscribe to featured offer config
  useEffect(() => {
    const unsub = SettingsService.subscribeFeaturedOffer((cfg) => setFeaturedOffer(cfg));
    return () => unsub();
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
      const updated = existingItem
        ? prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...prevCart, { ...product, quantity: 1 }];
      try { localStorage.setItem('vv_cart', JSON.stringify(updated)); } catch {}
      return updated;
    });
    toast({ title: "Added to cart", description: `${product.name} has been added to your cart.` });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    setTimeout(() => {
      try { localStorage.setItem('vv_cart', JSON.stringify(cart.filter(i => i.id !== productId))); } catch {}
    }, 0);
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
    setTimeout(() => {
      try {
        const updated = cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item);
        localStorage.setItem('vv_cart', JSON.stringify(updated.filter(i => i.quantity > 0)));
      } catch {}
    }, 0);
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

    // Ensure the product is in cart storage before redirecting
    const singleItem = [{ ...product, quantity: 1 }];
    try { localStorage.setItem('vv_cart', JSON.stringify(singleItem)); } catch {}
    setCart(singleItem);
    navigate('/checkout');
    toast({ title: "Proceeding to checkout", description: `Redirecting to payment for ${product.name}` });
  };

  const openProductDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
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
              <img 
                src={theme === 'dark' ? "/ultron (5).png" : "/ultron (4).png"} 
                alt="Ultron Logo" 
                className="ultron-logo-mobile md:ultron-logo-desktop"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text">
                  Ultron
                </h1>
                <p className="text-xs text-muted-foreground">Electronic Components & Kits</p>
              </div>
            </div>
            
            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full" ref={desktopSearchRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search components..."
                  value={searchQuery}
                  onFocus={() => setSuggestionsOpen(true)}
                  onChange={(e) => { setSearchQuery(e.target.value); setSuggestionsOpen(true); }}
                  className="pl-10"
                />
                {suggestionsOpen && suggestions.length > 0 && (
                  <div className="absolute z-40 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
                    <div className="p-2 grid grid-cols-2 gap-2">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          className="text-left text-sm px-2 py-1 rounded hover:bg-accent"
                          onClick={() => { setSearchQuery(s); setSuggestionsOpen(false); }}
                          type="button"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                onClick={() => {
                  if (isMobile) {
                    // mirror current state to LS then go to cart page
                    try { localStorage.setItem('vv_cart', JSON.stringify(cart)); } catch {}
                    navigate('/cart');
                  } else {
                    setIsCartOpen(!isCartOpen);
                  }
                }}
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
            <div className="relative w-full" ref={mobileSearchRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search components..."
                value={searchQuery}
                onFocus={() => setSuggestionsOpen(true)}
                onChange={(e) => { setSearchQuery(e.target.value); setSuggestionsOpen(true); }}
                className="pl-10"
              />
              {suggestionsOpen && suggestions.length > 0 && (
                <div className="absolute z-40 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
                  <div className="p-2 grid grid-cols-2 gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        className="text-left text-sm px-2 py-1 rounded hover:bg-accent"
                        onClick={() => { setSearchQuery(s); setSuggestionsOpen(false); }}
                        type="button"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
          {/* Recommended keywords (chips) */}
          {keywords.length > 0 && !searchQuery && (
            <div className="mt-3 flex flex-wrap gap-2">
              {keywords.slice(0, 10).map(k => (
                <button
                  key={k}
                  type="button"
                  className="text-xs px-2 py-1 rounded-full border hover:bg-accent"
                  onClick={() => setSearchQuery(k)}
                >
                  {k}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-6">
            {/**
             * Hero Ultron image retained for future reference.
             * Re-enable by removing JSX comments below.
             */}
            {/**
            <img 
              src={theme === 'dark' ? "/ultron (5).png" : "/ultron (4).png"} 
              alt="Ultron Logo" 
              className="ultron-hero-mobile md:ultron-hero-desktop"
            />
            */}
          </div>
          {/* Featured Offer inside hero (above title) */}
          {featuredOffer?.active && (
            <div className="mb-8">
              <Card className="inline-block text-left border-primary/30 bg-card">
                <CardContent className="py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-primary text-primary-foreground">Featured Offer</Badge>
                      {featuredOffer.badgeText ? (
                        <span className="text-xs text-muted-foreground">{featuredOffer.badgeText}</span>
                      ) : null}
                    </div>
                    <CardTitle className="text-xl">{featuredOffer.title}</CardTitle>
                    {featuredOffer.subtitle ? (
                      <CardDescription className="mt-1">{featuredOffer.subtitle}</CardDescription>
                    ) : null}
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-2xl font-bold text-primary">₹{featuredOffer.price}</span>
                      {featuredOffer.originalPrice ? (
                        <span className="text-sm text-muted-foreground line-through">₹{featuredOffer.originalPrice}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={async () => {
                        let product = products.find(p => p.id === featuredOffer.productId);
                        if (!product) {
                          try {
                            if (featuredOffer.productId && featuredOffer.productId !== 'products' && featuredOffer.productId.trim() !== '') {
                              product = await ProductService.getProductById(featuredOffer.productId) as any;
                            } else {
                              return;
                            }
                          } catch (error) {
                            return;
                          }
                        }
                        if (product) {
                          try {
                            const cartItem = [{ ...product, quantity: 1 }];
                            localStorage.setItem('vv_cart', JSON.stringify(cartItem));
                            if (featuredOffer.promoCode) {
                              localStorage.setItem('vv_promo', featuredOffer.promoCode);
                            }
                            navigate('/checkout');
                          } catch {}
                        }
                      }}
                    >
                      <CreditCard className="h-4 w-4 mr-2" /> Get Offer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
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

      {/* Featured Offer Banner removed here; now shown above hero title */}

      {/* Bulk Offer Flash Banner */}
      <section className="py-8 px-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-y border-primary/20">
        <div className="container mx-auto">
          <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary">Bulk Order Special!</h3>
                    <p className="text-muted-foreground">
                      Get special pricing for bulk orders. Order 5-9 kits on website, 10+ kits via WhatsApp.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link to="/bulk-offer">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Package className="h-4 w-4 mr-2" />
                      View Bulk Offers
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const message = `Hi! I want to buy 10+ kits so what will be the pricing?`;
                      const whatsappUrl = `https://wa.me/919156294374?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Products Section */}
          <div className="flex-1" data-products-section>
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
                  <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50 overflow-hidden cursor-pointer" onClick={() => openProductDialog(product)}>
                    <div className="relative">
                      <div 
                        className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-t-lg flex items-center justify-center overflow-hidden cursor-pointer relative"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (product.image) {
                            setSelectedImageForView({url: product.image, alt: product.name});
                            setShowImageViewer(true);
                          }
                        }}
                      >
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`text-muted-foreground text-sm ${product.image ? 'hidden' : ''}`}>
                          Product Image
                        </div>
                        
                        {/* Hover overlay for image zoom */}
                        {product.image && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="h-6 w-6 text-white" />
                          </div>
                        )}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          disabled={!product.inStock}
                          variant="outline"
                          className="flex-1"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                        
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            buyNow(product);
                          }}
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
                        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`text-xs text-muted-foreground ${item.image ? 'hidden' : ''}`}>
                            IMG
                          </div>
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
                        try { localStorage.setItem('vv_cart', JSON.stringify(cart)); } catch {}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
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
                <div><a href="/contact-us" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></div>
                <div><a href="/admin/products" className="text-muted-foreground hover:text-primary transition-colors">Products</a></div>
                <div><a href="/contact-us" className="text-muted-foreground hover:text-primary transition-colors">Support</a></div>
                <div><a href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm">
                <div><a href="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></div>
                <div><a href="/refund-policy" className="text-muted-foreground hover:text-primary transition-colors">Refund Policy</a></div>
                <div><a href="/shipping-policy" className="text-muted-foreground hover:text-primary transition-colors">Shipping Policy</a></div>
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
              © 2025 Ultron. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Product Detail Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              {selectedProduct?.category} • {selectedProduct?.inStock ? 'In Stock' : 'Out of Stock'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Images */}
              <div className="space-y-4">
                <div 
                  className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer relative hover:shadow-lg transition-all"
                  onClick={() => {
                    if (selectedProduct.image) {
                      setSelectedImageForView({url: selectedProduct.image, alt: selectedProduct.name});
                      setShowImageViewer(true);
                    }
                  }}
                >
                  {selectedProduct.image ? (
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name}
                      className="w-full h-full object-contain hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`text-muted-foreground text-lg ${selectedProduct.image ? 'hidden' : ''}`}>
                    Product Image
                  </div>
                  
                  {/* Hover overlay */}
                  {selectedProduct.image && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Additional Images */}
                {selectedProduct.images && selectedProduct.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {selectedProduct.images.map((image, index) => (
                      <div 
                        key={index} 
                        className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-md flex items-center justify-center overflow-hidden cursor-pointer relative hover:shadow-lg transition-all"
                        onClick={() => {
                          setSelectedImageForView({url: image, alt: `${selectedProduct.name} ${index + 1}`});
                          setShowImageViewer(true);
                        }}
                      >
                        <img 
                          src={image} 
                          alt={`${selectedProduct.name} ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className={`text-muted-foreground text-xs ${image ? 'hidden' : ''}`}>
                          Image {index + 1}
                        </div>
                        
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomIn className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                {/* Price */}
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-primary">₹{selectedProduct.price}</span>
                  {selectedProduct.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      ₹{selectedProduct.originalPrice}
                    </span>
                  )}
                  {selectedProduct.originalPrice && (
                    <Badge className="bg-red-500 text-white">
                      Save ₹{selectedProduct.originalPrice - selectedProduct.price}
                    </Badge>
                  )}
                </div>

                

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* What's in the Box */}
                {selectedProduct.whatsInBox && selectedProduct.whatsInBox.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">What's in the Box</h3>
                    <ul className="space-y-1">
                      {selectedProduct.whatsInBox.map((item, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warranty */}
                {selectedProduct.warranty && (
                  <div>
                    <h3 className="font-semibold mb-2">Warranty</h3>
                    <p className="text-sm text-muted-foreground">{selectedProduct.warranty}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setIsProductDialogOpen(false);
                    }}
                    disabled={!selectedProduct.inStock}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  
                  <Button
                    onClick={() => {
                      buyNow(selectedProduct);
                      setIsProductDialogOpen(false);
                    }}
                    disabled={!selectedProduct.inStock}
                    className="flex-1"
                    size="lg"
                  >
                    Buy Now
                  </Button>
                </div>

                {/* Stock Status */}
                <div className="flex items-center space-x-2 text-sm">
                  {selectedProduct.inStock ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-green-600 font-medium">In Stock</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-red-600 font-medium">Out of Stock</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={showImageViewer} onOpenChange={setShowImageViewer}>
        <DialogContent className="max-w-5xl max-h-[95vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <ZoomIn className="h-5 w-5" />
              {selectedImageForView?.alt}
            </DialogTitle>
          </DialogHeader>
          
          {selectedImageForView && (
            <div className="relative p-6 pt-4">
              <img
                src={selectedImageForView.url}
                alt={selectedImageForView.alt}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Index;
