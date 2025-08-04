import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MongoSignUpForm from '@/components/MongoSignUpForm';
import MongoLoginForm from '@/components/MongoLoginForm';
import MongoProfile from '@/components/MongoProfile';
import { authAPI } from '@/lib/auth-mongodb';

const MongoAuthDemo: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    // Check if user is already authenticated
    setIsAuthenticated(authAPI.isAuthenticated());
  }, []);

  // If user is authenticated, show profile
  if (isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">MongoDB + JWT Profile</h1>
          <p className="text-muted-foreground">
            You are successfully authenticated with MongoDB and JWT!
          </p>
        </div>
        <MongoProfile />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">MongoDB + JWT Authentication Demo</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This demo showcases JWT authentication with MongoDB backend integration. 
          Create an account or sign in to access your profile.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <MongoLoginForm />
          </TabsContent>
          
          <TabsContent value="signup">
            <MongoSignUpForm />
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Features Included</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <ul className="space-y-1">
              <li>✅ MongoDB database integration</li>
              <li>✅ JWT access & refresh tokens</li>
              <li>✅ User registration & login</li>
              <li>✅ Email/username availability checking</li>
              <li>✅ Profile management</li>
              <li>✅ Automatic token refresh</li>
              <li>✅ Secure password hashing</li>
              <li>✅ Protected API routes</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">API Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="space-y-2">
              <div><strong>POST</strong> /api/v2/auth/register</div>
              <div><strong>POST</strong> /api/v2/auth/login</div>
              <div><strong>GET</strong> /api/v2/auth/check-availability</div>
              <div><strong>POST</strong> /api/v2/auth/refresh-token</div>
              <div><strong>GET</strong> /api/v2/profile (protected)</div>
              <div><strong>PUT</strong> /api/v2/profile (protected)</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MongoAuthDemo;
