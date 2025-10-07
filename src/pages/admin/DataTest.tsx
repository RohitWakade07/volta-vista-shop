import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserService } from '@/services/userService';
import { PaymentService } from '@/services/paymentService';
import { ProductService } from '@/services/productService';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

const DataTest = () => {
  const { userProfile } = useAuth();
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'superadmin';

  const runTests = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    const results: any = {};

    try {
      // Test 1: Direct Firestore connection
      console.log('Test 1: Testing direct Firestore connection...');
      const usersSnapshot = await getDocs(collection(db, 'users'));
      results.directUsers = {
        success: true,
        count: usersSnapshot.docs.length,
        data: usersSnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      };
      console.log('Direct users test result:', results.directUsers);
    } catch (error) {
      results.directUsers = { success: false, error: error.message };
      console.error('Direct users test failed:', error);
    }

    try {
      // Test 2: UserService
      console.log('Test 2: Testing UserService...');
      const userStats = await UserService.getUserStats();
      results.userService = {
        success: true,
        stats: userStats
      };
      console.log('UserService test result:', results.userService);
    } catch (error) {
      results.userService = { success: false, error: error.message };
      console.error('UserService test failed:', error);
    }

    try {
      // Test 3: Orders collection
      console.log('Test 3: Testing orders collection...');
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      results.directOrders = {
        success: true,
        count: ordersSnapshot.docs.length,
        data: ordersSnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      };
      console.log('Direct orders test result:', results.directOrders);
    } catch (error) {
      results.directOrders = { success: false, error: error.message };
      console.error('Direct orders test failed:', error);
    }

    try {
      // Test 4: Products collection
      console.log('Test 4: Testing products collection...');
      const productsSnapshot = await getDocs(collection(db, 'products'));
      results.directProducts = {
        success: true,
        count: productsSnapshot.docs.length,
        data: productsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      };
      console.log('Direct products test result:', results.directProducts);
    } catch (error) {
      results.directProducts = { success: false, error: error.message };
      console.error('Direct products test failed:', error);
    }

    setTestResults(results);
    setLoading(false);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Data Fetch Test</h1>
            <p className="text-muted-foreground">Test Firebase data fetching capabilities</p>
          </div>
          <Button onClick={runTests} disabled={loading}>
            {loading ? 'Testing...' : 'Run Tests'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(testResults).map(([testName, result]: [string, any]) => (
            <Card key={testName}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {testName}
                </CardTitle>
                <CardDescription>
                  {result.success ? 'Success' : 'Failed'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result.success ? (
                  <div className="space-y-2">
                    {result.count !== undefined && (
                      <p><strong>Count:</strong> {result.count}</p>
                    )}
                    {result.stats && (
                      <div>
                        <p><strong>Stats:</strong></p>
                        <pre className="text-xs bg-muted p-2 rounded">
                          {JSON.stringify(result.stats, null, 2)}
                        </pre>
                      </div>
                    )}
                    {result.data && result.data.length > 0 && (
                      <div>
                        <p><strong>Sample Data:</strong></p>
                        <pre className="text-xs bg-muted p-2 rounded max-h-40 overflow-auto">
                          {JSON.stringify(result.data.slice(0, 2), null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600">
                    <p><strong>Error:</strong> {result.error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {Object.keys(testResults).length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Click "Run Tests" to test data fetching</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DataTest;

