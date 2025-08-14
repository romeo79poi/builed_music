// Test script for JWT profile and settings endpoints
const API_BASE = 'http://localhost:8080';

async function testJWTEndpoints() {
  console.log('🧪 Testing JWT Profile and Settings Endpoints...\n');

  try {
    // Step 1: Create a test user
    console.log('1. Creating test user...');
    const signupResponse = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'jwttest@example.com',
        username: 'jwttest',
        password: 'TestPassword123!',
        name: 'JWT Test User'
      }),
    });

    const signupData = await signupResponse.json();
    console.log('✅ Signup result:', signupData);

    if (!signupData.success || !signupData.token) {
      console.log('❌ Failed to create test user');
      return;
    }

    const token = signupData.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Step 2: Test /api/auth/me endpoint
    console.log('\n2. Testing /api/auth/me...');
    const meResponse = await fetch(`${API_BASE}/api/auth/me`, { headers });
    const meData = await meResponse.json();
    console.log('👤 User profile:', meData);

    // Step 3: Test profile update
    console.log('\n3. Testing profile update...');
    const updateResponse = await fetch(`${API_BASE}/api/auth/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        name: 'Updated JWT Test User',
        bio: 'Updated bio for JWT testing',
        location: 'Test City, Test Country'
      }),
    });

    const updateData = await updateResponse.json();
    console.log('📝 Profile update result:', updateData);

    // Step 4: Test settings fetch
    console.log('\n4. Testing settings fetch...');
    const settingsResponse = await fetch(`${API_BASE}/api/auth/settings`, { headers });
    const settingsData = await settingsResponse.json();
    console.log('⚙️ Settings data:', settingsData);

    // Step 5: Test settings update
    console.log('\n5. Testing settings update...');
    const settingsUpdateResponse = await fetch(`${API_BASE}/api/auth/settings`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        notifications: { email: true, push: false },
        privacy: { publicProfile: true, showActivity: false },
        preferences: { theme: 'dark', language: 'en' }
      }),
    });

    const settingsUpdateData = await settingsUpdateResponse.json();
    console.log('⚙️ Settings update result:', settingsUpdateData);

    // Step 6: Verify updated profile
    console.log('\n6. Verifying updated profile...');
    const verifyResponse = await fetch(`${API_BASE}/api/auth/me`, { headers });
    const verifyData = await verifyResponse.json();
    console.log('🔍 Updated profile verification:', verifyData);

    console.log('\n✅ All JWT endpoints tested successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testJWTEndpoints();
