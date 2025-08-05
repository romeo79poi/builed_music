import React, { useState } from 'react';
import { useFirebaseAuth } from '@/context/FirebaseContext';
import { hybridAPI } from '@/lib/hybrid-api';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Loader2, User, Mail, Lock, Phone } from 'lucide-react';
import { Badge } from './ui/badge';

export function FirebaseAuthDemo() {
  const {
    user,
    userProfile,
    loading,
    isAuthenticated,
    isConfigured,
    signInWithGoogle,
    signInWithFacebook,
    signUpWithEmail,
    signInWithEmail,
    signOut,
  } = useFirebaseAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setError('');
    setSuccess('');
    
    const result = await signInWithGoogle();
    
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Successfully signed in with Google!');
    }
    
    setAuthLoading(false);
  };

  const handleFacebookSignIn = async () => {
    setAuthLoading(true);
    setError('');
    setSuccess('');
    
    const result = await signInWithFacebook();
    
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Successfully signed in with Facebook!');
    }
    
    setAuthLoading(false);
  };

  const handleEmailSignUp = async () => {
    if (!email || !password || !username) {
      setError('Please fill in all fields');
      return;
    }

    setAuthLoading(true);
    setError('');
    setSuccess('');
    
    const result = await signUpWithEmail(email, password, {
      username,
      displayName: displayName || username,
    });
    
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Account created successfully! Please check your email for verification.');
      setEmail('');
      setPassword('');
      setUsername('');
      setDisplayName('');
    }
    
    setAuthLoading(false);
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setAuthLoading(true);
    setError('');
    setSuccess('');
    
    const result = await signInWithEmail(email, password);
    
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Successfully signed in!');
      setEmail('');
      setPassword('');
    }
    
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    const result = await signOut();
    
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Successfully signed out!');
    }
    
    setAuthLoading(false);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading Firebase...</span>
        </CardContent>
      </Card>
    );
  }

  if (!isConfigured) {
    return (
      <Card className="w-full max-w-md mx-auto border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Firebase Not Configured</CardTitle>
          <CardDescription className="text-yellow-600">
            Please set up your Firebase environment variables to use authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-yellow-700">
          <p>Required environment variables:</p>
          <ul className="mt-2 list-disc list-inside">
            <li>VITE_FIREBASE_API_KEY</li>
            <li>VITE_FIREBASE_AUTH_DOMAIN</li>
            <li>VITE_FIREBASE_PROJECT_ID</li>
            <li>VITE_FIREBASE_STORAGE_BUCKET</li>
            <li>VITE_FIREBASE_MESSAGING_SENDER_ID</li>
            <li>VITE_FIREBASE_APP_ID</li>
          </ul>
        </CardContent>
      </Card>
    );
  }

  if (isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Welcome Back!
          </CardTitle>
          <CardDescription>
            You're signed in with Firebase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {user?.email || 'No email'}
            </Badge>
          </div>
          
          {userProfile && (
            <div className="space-y-2">
              <p><strong>Username:</strong> {userProfile.username}</p>
              <p><strong>Display Name:</strong> {userProfile.displayName}</p>
              <p><strong>Verified:</strong> {user?.emailVerified ? '✅' : '❌'}</p>
              <p><strong>Premium:</strong> {userProfile.premium ? '✅' : '❌'}</p>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
              {success}
            </div>
          )}

          <Button 
            onClick={handleSignOut} 
            variant="outline" 
            className="w-full"
            disabled={authLoading}
          >
            {authLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Sign Out
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>CATCH Firebase Auth</CardTitle>
        <CardDescription>
          Sign in or create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <div className="space-y-4">
              <Button 
                onClick={handleGoogleSignIn} 
                variant="outline" 
                className="w-full"
                disabled={authLoading}
              >
                {authLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Continue with Google
              </Button>

              <Button 
                onClick={handleFacebookSignIn} 
                variant="outline" 
                className="w-full"
                disabled={authLoading}
              >
                {authLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Continue with Facebook
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={authLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={authLoading}
                  />
                </div>
                <Button 
                  onClick={handleEmailSignIn} 
                  className="w-full"
                  disabled={authLoading}
                >
                  {authLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Sign In
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-4">
              <Button 
                onClick={handleGoogleSignIn} 
                variant="outline" 
                className="w-full"
                disabled={authLoading}
              >
                {authLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Continue with Google
              </Button>

              <Button 
                onClick={handleFacebookSignIn} 
                variant="outline" 
                className="w-full"
                disabled={authLoading}
              >
                {authLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Continue with Facebook
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or create account with email
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={authLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="signup-displayname">Display Name</Label>
                  <Input
                    id="signup-displayname"
                    type="text"
                    placeholder="Your display name (optional)"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={authLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={authLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={authLoading}
                  />
                </div>
                <Button 
                  onClick={handleEmailSignUp} 
                  className="w-full"
                  disabled={authLoading}
                >
                  {authLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Create Account
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 text-sm text-green-600 bg-green-50 p-3 rounded">
            {success}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FirebaseAuthDemo;
