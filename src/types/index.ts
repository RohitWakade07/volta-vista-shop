export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'phonepe' | 'cod' | 'card';
  createdAt: Date;
  updatedAt: Date;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  trackingNumber?: string;
  promoCode?: string;
  discount?: number;
}

export interface PaymentDetails {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: Date;
}

export interface PhonePePayment {
  merchantId: string;
  merchantTransactionId: string;
  amount: number;
  redirectUrl: string;
  callbackUrl: string;
  merchantUserId: string;
  mobileNumber: string;
  paymentInstrument: {
    type: string;
  };
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  inStock: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'superadmin';
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  totalEarnings: number;
  createdAt: Date;
  lastLogin: Date;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
} 