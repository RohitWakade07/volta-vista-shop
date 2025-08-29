import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AdminProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  inStock: boolean;
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

export class ProductService {
  static subscribeProducts(onUpdate: (products: AdminProduct[]) => void): () => void {
    const q = query(collection(db, 'products'), orderBy('name'));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as AdminProduct[];
      onUpdate(items);
    });
    return unsub;
  }

  static async addProduct(data: Omit<AdminProduct, 'id'>) {
    await addDoc(collection(db, 'products'), data);
  }

  static async updateProduct(id: string, data: Partial<AdminProduct>) {
    await updateDoc(doc(db, 'products', id), data as any);
  }

  static async deleteProduct(id: string) {
    await deleteDoc(doc(db, 'products', id));
  }
}


