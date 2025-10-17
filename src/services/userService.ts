import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/types';

export class UserService {
  static subscribeUsers(onUpdate: (users: UserProfile[]) => void): () => void {
    console.log('UserService: Setting up users subscription...');
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      console.log('UserService: Received users snapshot with', snap.docs.length, 'documents');
      const users = snap.docs.map((d) => {
        const data = d.data();
        console.log('UserService: Processing user', d.id, data);
        return { ...data, id: d.id } as unknown as UserProfile;
      });
      console.log('UserService: Processed users:', users);
      onUpdate(users);
    }, (error) => {
      console.error('UserService: Error in users subscription:', error);
    });
    return unsub;
  }

  static async updateUserRole(uid: string, role: 'user' | 'admin' | 'superadmin') {
    await updateDoc(doc(db, 'users', uid), { role });
  }

  static async getActiveUsers(): Promise<UserProfile[]> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const q = query(
      collection(db, 'users'),
      where('lastLogin', '>=', oneDayAgo),
      orderBy('lastLogin', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as UserProfile[];
  }

  static async getUserStats() {
    console.log('UserService: Getting user stats...');
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      console.log('UserService: Retrieved', usersSnapshot.docs.length, 'users from Firestore');
      
      const users = usersSnapshot.docs.map((d) => {
        const data = d.data();
        console.log('UserService: Processing user for stats', d.id, data);
        return { ...data, id: d.id } as unknown as UserProfile;
      });
      
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const activeToday = users.filter(u => u.lastLogin && new Date(u.lastLogin) >= oneDayAgo).length;
      const activeThisWeek = users.filter(u => u.lastLogin && new Date(u.lastLogin) >= oneWeekAgo).length;
      const activeThisMonth = users.filter(u => u.lastLogin && new Date(u.lastLogin) >= oneMonthAgo).length;
      const newThisMonth = users.filter(u => u.createdAt && new Date(u.createdAt) >= oneMonthAgo).length;

      const stats = {
        totalUsers: users.length,
        activeToday,
        activeThisWeek,
        activeThisMonth,
        newThisMonth,
        adminUsers: users.filter(u => u.role === 'admin' || u.role === 'superadmin').length
      };
      
      console.log('UserService: Calculated stats:', stats);
      return stats;
    } catch (error) {
      console.error('UserService: Error getting user stats:', error);
      return {
        totalUsers: 0,
        activeToday: 0,
        activeThisWeek: 0,
        activeThisMonth: 0,
        newThisMonth: 0,
        adminUsers: 0
      };
    }
  }
}
