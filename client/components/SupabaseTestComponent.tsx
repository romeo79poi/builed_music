import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContextSupabase';
import { supabaseAPI } from '../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, CheckCircle, XCircle, Music, Users, Zap } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  duration?: number;
}

export default function SupabaseTestComponent() {
  const { user, supabaseUser } = useAuth();
  const { 
    trendingSongs, 
    userPlaylists, 
    likedSongs, 
    friendsActivity,
    loading 
  } = useMusic();
  
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'completed'>('idle');

  const tests: Array<{ name: string; test: () => Promise<void> }> = [
    {
      name: 'Supabase Client Connection',
      test: async () => {
        const startTime = Date.now();
        try {
          const { data, error } = await supabaseAPI.getCurrentUser();
          if (error && error.code !== 'PGRST116') throw error;
          const duration = Date.now() - startTime;
          updateTestResult('Supabase Client Connection', 'success', `Connected successfully (${duration}ms)`, duration);
        } catch (error: any) {
          updateTestResult('Supabase Client Connection', 'error', error.message);
        }
      }
    },
    {
      name: 'Authentication Status',
      test: async () => {
        const startTime = Date.now();
        try {
          if (!user && !supabaseUser) {
            throw new Error('No authenticated user found');
          }
          const duration = Date.now() - startTime;
          updateTestResult('Authentication Status', 'success', `User authenticated: ${user?.name || supabaseUser?.email}`, duration);
        } catch (error: any) {
          updateTestResult('Authentication Status', 'error', error.message);
        }
      }
    },
    {
      name: 'Trending Songs API',
      test: async () => {
        const startTime = Date.now();
        try {
          const { data, error } = await supabaseAPI.getTrendingSongs(5);
          if (error) throw error;
          const duration = Date.now() - startTime;
          updateTestResult('Trending Songs API', 'success', `Fetched ${data?.length || 0} trending songs (${duration}ms)`, duration);
        } catch (error: any) {
          updateTestResult('Trending Songs API', 'error', error.message);
        }
      }
    },
    {
      name: 'User Playlists API',
      test: async () => {
        const startTime = Date.now();
        try {
          if (!user) {
            updateTestResult('User Playlists API', 'error', 'No authenticated user');
            return;
          }
          const { data, error } = await supabaseAPI.getUserPlaylists(user.id);
          if (error) throw error;
          const duration = Date.now() - startTime;
          updateTestResult('User Playlists API', 'success', `Fetched ${data?.length || 0} playlists (${duration}ms)`, duration);
        } catch (error: any) {
          updateTestResult('User Playlists API', 'error', error.message);
        }
      }
    },
    {
      name: 'Search Functionality',
      test: async () => {
        const startTime = Date.now();
        try {
          const { data, error } = await supabaseAPI.searchSongs('test', 3);
          if (error) throw error;
          const duration = Date.now() - startTime;
          updateTestResult('Search Functionality', 'success', `Search returned ${data?.length || 0} results (${duration}ms)`, duration);
        } catch (error: any) {
          updateTestResult('Search Functionality', 'error', error.message);
        }
      }
    },
    {
      name: 'Real-time Connection',
      test: async () => {
        const startTime = Date.now();
        try {
          // Test real-time subscription
          const channel = supabaseAPI.supabase
            .channel('test-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'songs' }, () => {})
            .subscribe();
          
          // Wait a moment for subscription to establish
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const duration = Date.now() - startTime;
          channel.unsubscribe();
          updateTestResult('Real-time Connection', 'success', `Real-time subscription established (${duration}ms)`, duration);
        } catch (error: any) {
          updateTestResult('Real-time Connection', 'error', error.message);
        }
      }
    },
    {
      name: 'Data Context State',
      test: async () => {
        const startTime = Date.now();
        try {
          const contextData = {
            trendingSongs: trendingSongs.length,
            userPlaylists: userPlaylists.length,
            likedSongs: likedSongs.length,
            friendsActivity: friendsActivity.length,
            loadingStates: Object.values(loading).filter(Boolean).length
          };
          
          const duration = Date.now() - startTime;
          updateTestResult('Data Context State', 'success', 
            `Context loaded: ${contextData.trendingSongs} songs, ${contextData.userPlaylists} playlists, ${contextData.likedSongs} liked songs`, duration);
        } catch (error: any) {
          updateTestResult('Data Context State', 'error', error.message);
        }
      }
    }
  ];

  const updateTestResult = (name: string, status: 'success' | 'error', message: string, duration?: number) => {
    setTestResults(prev => prev.map(result => 
      result.name === name 
        ? { ...result, status, message, duration }
        : result
    ));
  };

  const runTests = async () => {
    setIsRunningTests(true);
    setOverallStatus('running');
    
    // Initialize test results
    setTestResults(tests.map(test => ({
      name: test.name,
      status: 'pending',
      message: 'Running...'
    })));

    // Run tests sequentially
    for (const test of tests) {
      try {
        await test.test();
      } catch (error) {
        console.error(`Test failed: ${test.name}`, error);
      }
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunningTests(false);
    setOverallStatus('completed');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const totalTests = testResults.length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-500" />
          Supabase Integration Test Suite
        </CardTitle>
        <CardDescription>
          Test the complete frontend-backend integration with Supabase
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Test Overview */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-purple-500" />
            <span className="font-medium">Authentication:</span>
            <Badge variant={user || supabaseUser ? "default" : "destructive"}>
              {user || supabaseUser ? "Connected" : "Not Connected"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="font-medium">User:</span>
            <span className="text-sm text-gray-600">
              {user?.name || supabaseUser?.email || "Anonymous"}
            </span>
          </div>
        </div>

        {/* Test Results Summary */}
        {overallStatus === 'completed' && (
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{totalTests}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="ml-auto">
              <Badge variant={errorCount === 0 ? "default" : "destructive"}>
                {errorCount === 0 ? "All Tests Passed" : `${errorCount} Tests Failed`}
              </Badge>
            </div>
          </div>
        )}

        {/* Run Tests Button */}
        <Button 
          onClick={runTests} 
          disabled={isRunningTests}
          className="w-full"
          size="lg"
        >
          {isRunningTests ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Integration Tests'
          )}
        </Button>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Test Results</h3>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div 
                  key={result.name}
                  className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.name}</span>
                    </div>
                    {result.duration && (
                      <Badge variant="outline" className="text-xs">
                        {result.duration}ms
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm opacity-80">{result.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <h4 className="font-medium">Data Context Status</h4>
            <div className="text-sm space-y-1">
              <div>Trending Songs: {trendingSongs.length}</div>
              <div>User Playlists: {userPlaylists.length}</div>
              <div>Liked Songs: {likedSongs.length}</div>
              <div>Friends Activity: {friendsActivity.length}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Loading States</h4>
            <div className="text-sm space-y-1">
              {Object.entries(loading).map(([key, isLoading]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key}:</span>
                  <Badge variant={isLoading ? "destructive" : "default"} className="text-xs">
                    {isLoading ? "Loading" : "Ready"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
