import { collection, addDoc, updateDoc, doc, getDocs, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, PaymentDetails, PhonePePayment } from '@/types';
// Legacy client-side gateway code removed

// Removed client-side payment initiation; handled by server webhook/create endpoints

export class PaymentService {
  // Client no longer talks to gateway directly

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

  // Realtime subscription to all orders (admin use)
  static subscribeAllOrders(onUpdate: (orders: Order[]) => void): () => void {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const orders = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate() || new Date(),
        updatedAt: d.data().updatedAt?.toDate() || new Date(),
      })) as Order[];
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