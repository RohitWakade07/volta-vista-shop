import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AdminProduct {
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

  static async getProductById(id: string): Promise<AdminProduct | null> {       
    // Validate that id is not empty, not "products", and is a valid string
    if (!id || id.trim() === '' || id === 'products') {
      throw new Error(`Invalid product ID: "${id}". Product ID cannot be empty or "products".`);
    }
    
    const ref = doc(db, 'products', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as any) } as AdminProduct;
  }
}


