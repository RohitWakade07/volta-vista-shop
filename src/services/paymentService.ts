import { collection, addDoc, updateDoc, doc, getDocs, query, where, onSnapshot, orderBy, deleteDoc, getDoc } from 'firebase/firestore';
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
    console.log('PaymentService: Setting up orders subscription...');
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));    
    const unsub = onSnapshot(q, (snap) => {
      console.log('PaymentService: Received orders snapshot with', snap.docs.length, 'documents');
      const orders = snap.docs.map(d => {
        const data = d.data();
        console.log('PaymentService: Processing order', d.id, data);
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Order;
      });
      console.log('PaymentService: Processed orders:', orders);
      onUpdate(orders);
    }, (error) => {
      console.error('PaymentService: Error in orders subscription:', error);
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
      
      // Fetch order total for payment record
      const orderSnap = await getDoc(doc(db, 'orders', orderId));
      const amount = (orderSnap.exists() ? (orderSnap.data() as any).total : 0) || 0;
      await this.createPaymentRecord({
        orderId,
        amount,
        currency: 'INR',
        paymentMethod: 'razorpay',
        status: 'completed',
        transactionId,
      });
    } catch (error) {
      console.error('Error processing payment success:', error);
      throw new Error('Failed to process payment');
    }
  }

  // Cancel order (soft delete by changing status)
  static async cancelOrder(orderId: string): Promise<void> {
    try {
      await this.updateOrderStatus(orderId, 'cancelled');
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw new Error('Failed to cancel order');
    }
  }

  // Delete order permanently (hard delete)
  static async deleteOrder(orderId: string): Promise<void> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await deleteDoc(orderRef);
    } catch (error) {
      console.error('Error deleting order:', error);
      throw new Error('Failed to delete order');
    }
  }

  // Generate order ID
  static generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  // --- Razorpay Integration ---
  static async createRazorpayOrder(orderId: string, amount: number) {
    const url = `${location.origin}/__/functions/razorpayCreateOrder`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amount, currency: 'INR' })
    });
    if (!res.ok) throw new Error('Failed to create Razorpay order');
    return res.json(); // { order, key }
  }

  static async verifyRazorpaySignature(data: any) {
    const url = `${location.origin}/__/functions/razorpayVerify`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Verification failed');
    return res.json(); // { verified }
  }


  // Update due payment amount for partial payments
  static async updateDuePayment(orderId: string, newDueAmount: number): Promise<void> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        throw new Error('Order not found');
      }
      
      const orderData = orderSnap.data() as any;
      
      if (!orderData.partialPayment?.enabled) {
        throw new Error('Order does not have partial payment enabled');
      }
      
      // Ensure the new due amount is not negative
      const validDueAmount = Math.max(0, newDueAmount);
      
      await updateDoc(orderRef, {
        'partialPayment.dueOnDelivery': validDueAmount,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating due payment:', error);
      throw new Error('Failed to update due payment');
    }
  }

  // Mark remaining payment as received for partial payments
  static async markRemainingPaymentReceived(orderId: string): Promise<void> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        throw new Error('Order not found');
      }
      
      const orderData = orderSnap.data() as any;
      
      if (!orderData.partialPayment?.enabled) {
        throw new Error('Order does not have partial payment enabled');
      }
      
      if (orderData.partialPayment.dueOnDelivery <= 0) {
        throw new Error('No remaining payment due for this order');
      }
      
      // Update the order to mark remaining payment as received
      await updateDoc(orderRef, {
        'partialPayment.dueOnDelivery': 0,
        'partialPayment.remainingPaymentReceived': true,
        'partialPayment.remainingPaymentReceivedAt': new Date(),
        paymentStatus: 'completed',
        status: 'processing', // Move to processing when full payment is received
        updatedAt: new Date()
      });
      
      // Create a payment record for the remaining amount
      const remainingAmount = orderData.partialPayment.dueOnDelivery;
      await this.createPaymentRecord({
        orderId,
        amount: remainingAmount,
        currency: 'INR',
        paymentMethod: 'cod', // Assuming remaining payment is collected on delivery
        status: 'completed',
        transactionId: `REMAINING-${orderId}-${Date.now()}`
      });
    } catch (error) {
      console.error('Error marking remaining payment received:', error);
      throw new Error('Failed to mark remaining payment received');
    }
  }

  // Fix incorrectly backfilled data - remove partial payment from fully paid orders
  static async fixIncorrectlyBackfilledData(): Promise<{ fixed: number }> {
    try {
      // Get all orders that have partialPayment but were actually fully paid
      const q = query(collection(db, 'orders'));
      const querySnapshot = await getDocs(q);
      
      let fixedCount = 0;
      const updatePromises: Promise<void>[] = [];
      
      querySnapshot.docs.forEach((doc) => {
        const orderData = doc.data() as any;
        
        // Check if order has partialPayment but was actually fully paid
        // This includes orders where:
        // 1. partialPayment exists
        // 2. paymentStatus is 'completed' 
        // 3. No transactionId indicating it was a partial payment
        // 4. The order was created before partial payment system was implemented
        if (orderData.partialPayment?.enabled && 
            orderData.paymentStatus === 'completed' && 
            orderData.transactionId && 
            !orderData.transactionId.includes('REMAINING-')) {
          
          // This was likely a fully paid order that got incorrectly backfilled
          const updatePromise = updateDoc(doc.ref, {
            partialPayment: null, // Remove partial payment data
            updatedAt: new Date()
          }).then(() => {
            fixedCount++;
          });
          
          updatePromises.push(updatePromise);
        }
      });
      
      // Wait for all updates to complete
      await Promise.all(updatePromises);
      
      return { fixed: fixedCount };
    } catch (error) {
      console.error('Error fixing incorrectly backfilled data:', error);
      throw new Error('Failed to fix backfilled data');
    }
  }
} 