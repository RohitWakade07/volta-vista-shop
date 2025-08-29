import { collection, addDoc, updateDoc, doc, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, PaymentDetails, PhonePePayment } from '@/types';

// PhonePe API Configuration (for testing)
const PHONEPE_CONFIG = {
  merchantId: 'PGTESTPAYUAT', // Test merchant ID
  saltKey: '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399', // Test salt key
  saltIndex: 1,
  baseUrl: 'https://api-preprod.phonepe.com/apis/pg-sandbox', // Test environment
};

export class PaymentService {
  // Generate PhonePe payment URL
  static async createPhonePePayment(order: Order): Promise<string> {
    const payload = {
      merchantId: PHONEPE_CONFIG.merchantId,
      merchantTransactionId: order.id,
      amount: order.total * 100, // Amount in paise
      redirectUrl: `${window.location.origin}/orders/${order.id}`,
      callbackUrl: `${window.location.origin}/orders/${order.id}`,
      merchantUserId: order.userId,
      mobileNumber: order.shippingAddress.phone,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    // In a real implementation, you would make an API call to PhonePe
    // For testing, we'll simulate the payment flow
    console.log('PhonePe Payment Payload:', payload);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock payment URL for testing
    return `${window.location.origin}/payment/test?orderId=${order.id}&amount=${order.total}`;
  }

  // Create order in Firestore
  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const order: Omit<Order, 'id'> = {
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'orders'), order);
      return docRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']): Promise<void> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (paymentStatus) {
        updateData.paymentStatus = paymentStatus;
      }

      await updateDoc(orderRef, updateData);
    } catch (error) {
      console.error('Error updating order:', error);
      throw new Error('Failed to update order status');
    }
  }

  // Get user orders
  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', userId));
      
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Order[];
      // Sort client-side to avoid composite index requirement
      orders.sort((a, b) => (b.createdAt as any) - (a.createdAt as any));
      return orders;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  // Realtime subscription to user orders
  static subscribeUserOrders(userId: string, onUpdate: (orders: Order[]) => void): () => void {
    const q = query(collection(db, 'orders'), where('userId', '==', userId));
    const unsub = onSnapshot(q, (snap) => {
      const orders = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate() || new Date(),
        updatedAt: d.data().updatedAt?.toDate() || new Date(),
      })) as Order[];
      orders.sort((a, b) => (b.createdAt as any) - (a.createdAt as any));
      onUpdate(orders);
    });
    return unsub;
  }

  // Create payment record
  static async createPaymentRecord(paymentData: Omit<PaymentDetails, 'createdAt'>): Promise<void> {
    try {
      const payment: PaymentDetails = {
        ...paymentData,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'payments'), payment);
    } catch (error) {
      console.error('Error creating payment record:', error);
      throw new Error('Failed to create payment record');
    }
  }

  // Process payment success
  static async processPaymentSuccess(orderId: string, transactionId: string): Promise<void> {
    try {
      // Update order payment status
      await this.updateOrderStatus(orderId, 'processing', 'completed');
      
      // Create payment record
      await this.createPaymentRecord({
        orderId,
        amount: 0, // Will be fetched from order
        currency: 'INR',
        paymentMethod: 'phonepe',
        status: 'completed',
        transactionId,
      });
    } catch (error) {
      console.error('Error processing payment success:', error);
      throw new Error('Failed to process payment');
    }
  }

  // Generate order ID
  static generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
} 