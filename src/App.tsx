import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Dashboard from '@/pages/admin/Dashboard';
import Products from '@/pages/admin/Products';
import OrdersAdmin from '@/pages/admin/Orders';
import ImageUpload from '@/pages/admin/ImageUpload';
import Profile from '@/pages/Profile';
import Checkout from '@/pages/Checkout';
import PaymentTest from '@/pages/PaymentTest';
import OrderDetails from '@/pages/OrderDetails';
import Cart from '@/pages/Cart';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import RefundPolicy from '@/pages/RefundPolicy';
import ShippingPolicy from '@/pages/ShippingPolicy';
import ContactUs from '@/pages/ContactUs';

const queryClient = new QueryClient();

function App() {
  console.log('App component rendering...'); // Debug log
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth/login" element={
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                } />
                <Route path="/auth/register" element={
                  <ProtectedRoute requireAuth={false}>
                    <Register />
                  </ProtectedRoute>
                } />
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/products" element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                } />
                {/* Convenience redirects to handle common/uppercase paths */}
                <Route path="/products" element={<Navigate to="/admin/products" replace />} />
                <Route path="/Products" element={<Navigate to="/admin/products" replace />} />
                <Route path="/admin/orders" element={
                  <ProtectedRoute>
                    <OrdersAdmin />
                  </ProtectedRoute>
                } />
                <Route path="/admin/images" element={
                  <ProtectedRoute>
                    <ImageUpload />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/cart" element={<Cart />} />
                <Route path="/payment/test" element={<PaymentTest />} />
                <Route path="/orders/:id" element={<OrderDetails />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </Router>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
