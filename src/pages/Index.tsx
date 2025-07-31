
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  inStock: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

const Index = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const products: Product[] = [
    {
      id: "1",
      name: "Arduino Uno R3",
      price: 24.99,
      image: "/api/placeholder/300/200",
      description: "Microcontroller board based on the ATmega328P",
      category: "Microcontrollers",
      inStock: true
    },
    {
      id: "2", 
      name: "Motor Driver L298N",
      price: 8.99,
      image: "/api/placeholder/300/200",
      description: "Dual H-Bridge Motor Driver for DC and Stepper Motors",
      category: "Motor Drivers",
      inStock: true
    },
    {
      id: "3",
      name: "Breadboard 830 Point",
      price: 5.99,
      image: "/api/placeholder/300/200", 
      description: "Solderless breadboard for prototyping circuits",
      category: "Prototyping",
      inStock: true
    },
    {
      id: "4",
      name: "Raspberry Pi 4B",
      price: 75.00,
      image: "/api/placeholder/300/200",
      description: "Single-board computer with ARM Cortex-A72 processor",
      category: "Single Board Computers",
      inStock: false
    },
    {
      id: "5",
      name: "Servo Motor SG90",
      price: 3.50,
      image: "/api/placeholder/300/200",
      description: "Micro servo motor for robotics projects",
      category: "Motors",
      inStock: true
    },
    {
      id: "6",
      name: "ESP32 DevKit",
      price: 12.99,
      image: "/api/placeholder/300/200",
      description: "WiFi and Bluetooth enabled microcontroller",
      category: "Microcontrollers", 
      inStock: true
    }
  ];

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
    toast({
      title: "Proceeding to checkout",
      description: `Redirecting to payment for ${product.name}`,
    });
    // Here you would redirect to payment/checkout page
    console.log('Buy now clicked for:', product);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Volta Vista</h1>
              <p className="text-muted-foreground">Electronic Components & Kits</p>
            </div>
            
            {/* Cart Button */}
            <Button
              variant="outline"
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Products Grid */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Featured Components</h2>
              <p className="text-muted-foreground">Discover our latest electronic components and development kits</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="bg-card border-border hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                    <div className="text-muted-foreground text-sm">Product Image</div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <Badge variant={product.inStock ? "default" : "secondary"}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">{product.description}</CardDescription>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-primary">${product.price}</span>
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
          </div>

          {/* Cart Sidebar */}
          {isCartOpen && (
            <div className="w-80 bg-card border border-border rounded-lg p-6 h-fit">
              <h3 className="text-xl font-semibold mb-4">Shopping Cart</h3>
              
              {cart.length === 0 ? (
                <p className="text-muted-foreground">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b border-border pb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">${item.price}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-8 text-center">{item.quantity}</span>
                          
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Total: ${getTotalPrice().toFixed(2)}</span>
                    </div>
                    
                    <Button className="w-full">
                      Proceed to Checkout
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
