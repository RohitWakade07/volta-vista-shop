import { collection, addDoc, query, where, onSnapshot, updateDoc, deleteDoc, doc, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Promo {
  id: string;
  code: string; // UPPERCASE
  type: 'flat';
  amount: number; // in INR
  active: boolean;
  createdAt: Date;
  productIds?: string[]; // optional list of applicable products
}

const promosCol = collection(db, 'promos');

export class PromoService {
  static async create(codeRaw: string, amount: number, productIds: string[] = []) {
    const code = (codeRaw || '').trim().toUpperCase();
    if (!code) throw new Error('Code is required');
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be greater than 0');
    if (!Array.isArray(productIds)) throw new Error('productIds must be an array');
    await addDoc(promosCol, { code, type: 'flat', amount, active: true, createdAt: new Date(), productIds } as any);
  }

  static subscribe(onUpdate: (items: Promo[]) => void) {
    const q = query(promosCol, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Promo[];
      onUpdate(items);
    });
  }

  static async toggleActive(id: string, active: boolean) {
    await updateDoc(doc(db, 'promos', id), { active } as any);
  }

  static async remove(id: string) {
    await deleteDoc(doc(db, 'promos', id));
  }

  static async findByCode(codeRaw: string): Promise<Promo | null> {
    const code = (codeRaw || '').trim().toUpperCase();
    if (!code) return null;
    const q = query(promosCol, where('code', '==', code), where('active', '==', true));
    const res = await getDocs(q);
    const d = res.docs[0];
    if (!d) return null;
    return { id: d.id, ...(d.data() as any) } as Promo;
  }
}


