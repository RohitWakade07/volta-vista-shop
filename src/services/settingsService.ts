import { db } from '@/lib/firebase';
import { collection, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

export interface FeaturedOfferConfig {
  active: boolean;
  title: string;
  subtitle: string;
  price: number;
  originalPrice?: number | null;
  badgeText?: string | null;
  productId: string; // product to link/buy
  promoCode?: string | null; // optional promo to apply
  updatedAt: number;
}

const SETTINGS_COLLECTION = 'settings';
const FEATURED_OFFER_DOC_ID = 'featuredOffer';

export const SettingsService = {
  async getFeaturedOffer(): Promise<FeaturedOfferConfig | null> {
    if (!db) return null as any;
    const ref = doc(collection(db, SETTINGS_COLLECTION), FEATURED_OFFER_DOC_ID);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as FeaturedOfferConfig;
  },

  subscribeFeaturedOffer(callback: (config: FeaturedOfferConfig | null) => void) {
    if (!db) {
      callback(null);
      return () => {};
    }
    const ref = doc(collection(db, SETTINGS_COLLECTION), FEATURED_OFFER_DOC_ID);
    return onSnapshot(ref, (snap) => {
      callback(snap.exists() ? (snap.data() as FeaturedOfferConfig) : null);
    });
  },

  async upsertFeaturedOffer(config: Omit<FeaturedOfferConfig, 'updatedAt'>) {
    if (!db) throw new Error('Firestore not initialized');
    const ref = doc(collection(db, SETTINGS_COLLECTION), FEATURED_OFFER_DOC_ID);
    const data: FeaturedOfferConfig = { ...config, updatedAt: Date.now() } as FeaturedOfferConfig;
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await updateDoc(ref, data as any);
    } else {
      await setDoc(ref, data as any);
    }
  },
};


