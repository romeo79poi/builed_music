import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabaseAPI } from '../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Database, Users } from 'lucide-react';

export default function SupabaseConnectionTest() {
  const { user, supabaseUser } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<string>('');

  const testConnection = async () => {
    setConnectionStatus('testing');
    setTestResult('Testing Supabase connection...');

    try {
      // Test basic connection
      const { data, error } = await supabaseAPI.getCurrentUser();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Test trending songs query
      const { data: songs, error: songsError } = await supabaseAPI.getTrendingSongs(5);
      
      if (songsError) {
        setTestResult(`Songs query failed: ${songsError.message}`);
        setConnectionStatus('error');
        return;
      }

      setTestResult(`✅ Supabase connected! Found ${songs?.length || 0} trending songs`);
      setConnectionStatus('success');
    } catch (error: any) {
      setTestResult(`❌ Connection failed: ${error.message}`);
      setConnectionStatus('error');
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'testing':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Database className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getStatusIcon()}
          Supabase Connection Test
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Auth Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Authentication:</span>
          <Badge variant={user || supabaseUser ? "default" : "secondary"}>
            {user || supabaseUser ? "Connected" : "Not Connected"}
          </Badge>
        </div>

        {user || supabaseUser ? (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" />
            <span>{user?.name || supabaseUser?.email || "Anonymous"}</span>
          </div>
        ) : null}

        {/* Test Button */}
        <Button 
          onClick={testConnection} 
          disabled={connectionStatus === 'testing'}
          className="w-full"
          variant="outline"
        >
          {connectionStatus === 'testing' ? 'Testing...' : 'Test Supabase Connection'}
        </Button>

        {/* Test Result */}
        {testResult && (
          <div className={`text-sm p-3 rounded-lg bg-gray-50 ${getStatusColor()}`}>
            {testResult}
          </div>
        )}

        {/* Environment Check */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</div>
          <div>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</div>
        </div>
      </CardContent>
    </Card>
  );
}
