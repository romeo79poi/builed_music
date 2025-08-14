// Test script for backend JWT authentication
// This tests the authentication flow to ensure it's working correctly

const API_BASE = 'http://localhost:3000'; // Adjust if needed

async function testBackendAuth() {
  console.log('🧪 Testing Backend JWT Authentication...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Checking server connection...');
    const healthResponse = await fetch(`${API_BASE}/api/health`);
    if (healthResponse.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server connection failed');
      return;
    }

    // Test 2: Test signup with OTP
    console.log('\n2. Testing OTP signup...');
    const signupOTPResponse = await fetch(`${API_BASE}/api/auth/signup/request-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123!',
        name: 'Test User',
        username: 'testuser'
      }),
    });

    const signupOTPData = await signupOTPResponse.json();
    console.log('📧 Signup OTP result:', signupOTPData);

    // Test 3: Test direct signup (without OTP for testing)
    console.log('\n3. Testing direct signup...');
    const signupResponse = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'directtest@example.com',
        password: 'TestPassword123!',
        name: 'Direct Test User',
        username: 'directtestuser'
      }),
    });

    const signupData = await signupResponse.json();
    console.log('👤 Direct signup result:', signupData);

    if (signupData.success && signupData.token) {
      // Test 4: Test authenticated endpoint
      console.log('\n4. Testing authenticated endpoint...');
      const meResponse = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${signupData.token}`,
          'Content-Type': 'application/json',
        },
      });

      const meData = await meResponse.json();
      console.log('🔒 Authenticated user data:', meData);

      // Test 5: Test login
      console.log('\n5. Testing login...');
      const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'directtest@example.com',
          password: 'TestPassword123!'
        }),
      });

      const loginData = await loginResponse.json();
      console.log('🔑 Login result:', loginData);

      // Test 6: Test Google OAuth (mock)
      console.log('\n6. Testing Google OAuth...');
      const googleResponse = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: 'mock_google_token_123'
        }),
      });

      const googleData = await googleResponse.json();
      console.log('🔍 Google OAuth result:', googleData);
    }

    console.log('\n✅ Backend authentication test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testBackendAuth();
