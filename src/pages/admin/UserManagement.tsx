import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { UserService } from '@/services/userService';
import { UserProfile } from '@/types';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Calendar, 
  Search,
  RefreshCw,
  TrendingUp,
  Clock
} from 'lucide-react';

const UserManagement = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin' | 'superadmin'>('all');
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    activeThisWeek: 0,
    activeThisMonth: 0,
    newThisMonth: 0,
    adminUsers: 0
  });

  const isSuperAdmin = userProfile?.role === 'superadmin';
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'superadmin';

  useEffect(() => {
    if (!isAdmin) {
      console.log('UserManagement: User is not admin, skipping data load');
      return;
    }

    console.log('UserManagement: Setting up user subscription...');
    const unsub = UserService.subscribeUsers((userList) => {
      console.log('UserManagement: Received users:', userList.length);
      setUsers(userList);
      setLoading(false);
    });

    // Load user stats
    console.log('UserManagement: Loading user stats...');
    UserService.getUserStats().then((stats) => {
      console.log('UserManagement: Received user stats:', stats);
      setUserStats(stats);
    }).catch((error) => {
      console.error('UserManagement: Error loading user stats:', error);
    });

    return () => {
      console.log('UserManagement: Cleaning up subscription...');
      unsub();
    };
  }, [isAdmin]);

  useEffect(() => {
    let filtered = users;

    // Filter by search
    if (search) {
      filtered = filtered.filter(user => 
        user.displayName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.uid.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, search, roleFilter]);

  const updateUserRole = async (uid: string, newRole: 'user' | 'admin' | 'superadmin') => {
    try {
      await UserService.updateUserRole(uid, newRole);
      toast({
        title: 'Success',
        description: `User role updated to ${newRole}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLastLoginStatus = (lastLogin: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - new Date(lastLogin).getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return { text: 'Active now', color: 'text-green-600' };
    if (diffInHours < 24) return { text: 'Active today', color: 'text-green-500' };
    if (diffInHours < 168) return { text: 'Active this week', color: 'text-yellow-500' };
    if (diffInHours < 720) return { text: 'Active this month', color: 'text-orange-500' };
    return { text: 'Inactive', color: 'text-gray-500' };
  };

  const refreshStats = async () => {
    setLoading(true);
    try {
      const stats = await UserService.getUserStats();
      setUserStats(stats);
      toast({
        title: 'Refreshed',
        description: 'User statistics updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access user management.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage users and view activity statistics</p>
          </div>
          <Button onClick={refreshStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{userStats.newThisMonth} new this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Today</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.activeToday}</div>
              <p className="text-xs text-muted-foreground">
                {userStats.activeToday > 0 ? 'Users active in last 24h' : 'No recent activity'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.activeThisWeek}</div>
              <p className="text-xs text-muted-foreground">
                {userStats.activeThisWeek > 0 ? 'Users active in last 7 days' : 'No activity this week'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active This Month</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.activeThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                {userStats.activeThisMonth > 0 ? 'Users active in last 30 days' : 'No activity this month'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.adminUsers}</div>
              <p className="text-xs text-muted-foreground">
                {userStats.adminUsers > 0 ? 'Users with admin privileges' : 'No admin users'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.newThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                {userStats.newThisMonth > 0 ? 'New registrations' : 'No new users'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  {isSuperAdmin && <SelectItem value="superadmin">Super Admins</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Users ({filteredUsers.length})</span>
            </CardTitle>
            <CardDescription>Manage user roles and view activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredUsers.map((user) => {
              const lastLoginStatus = getLastLoginStatus(user.lastLogin);
              return (
                <Card key={user.uid} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{user.displayName}</h3>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{user.email}</span>
                          <span className={lastLoginStatus.color}>
                            {lastLoginStatus.text}
                          </span>
                          <span>
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {user.referralCode && (
                          <div className="text-xs text-muted-foreground">
                            Referral Code: {user.referralCode} | Referrals: {user.referralCount}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {isSuperAdmin && user.uid !== userProfile?.uid && (
                          <Select
                            value={user.role}
                            onValueChange={(newRole: any) => updateUserRole(user.uid, newRole)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="superadmin">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        {!isSuperAdmin && user.role === 'user' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateUserRole(user.uid, 'admin')}
                          >
                            Make Admin
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {search || roleFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'Users will appear here once they register.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
