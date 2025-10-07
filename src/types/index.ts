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
  paymentMethod: 'phonepe' | 'razorpay' | 'cod' | 'card';
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
  transactionId?: string;
  gatewayOrderId?: string;
  student?: {
    name: string;
    branchDiv: string;
    branch?: string;
    collegeName?: string;
    college?: string;
    phone: string;
    campus: string;
  };
  partialPayment?: {
    enabled: boolean;
    paidNow: number; // amount collected in this payment
    dueOnDelivery: number; // remaining amount to be collected later
    remainingPaymentReceived?: boolean; // whether remaining payment has been received
    remainingPaymentReceivedAt?: Date; // when remaining payment was received
  };
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
  allowPartialPayment?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  category: string;
  inStock: boolean;
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  allowPartialPayment?: boolean;
  images?: string[];
  whatsInBox?: string[];
  warranty?: string;
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