// Simple test script to verify auth endpoints work
// Run this with: node test-auth.js

const testSignup = async () => {
  try {
    console.log('🧪 Testing signup flow...');
    
    // Test email verification
    console.log('📧 Testing email verification...');
    const emailVerifyResponse = await fetch('http://localhost:8080/api/auth/send-email-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com'
      }),
    });
    
    const emailVerifyData = await emailVerifyResponse.json();
    console.log('Email verification response:', emailVerifyData);
    
    if (emailVerifyData.success && emailVerifyData.debugCode) {
      console.log(`🔑 Debug verification code: ${emailVerifyData.debugCode}`);
      
      // Test email verification
      console.log('✅ Testing email verification...');
      const verifyResponse = await fetch('http://localhost:8080/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          code: emailVerifyData.debugCode
        }),
      });
      
      const verifyData = await verifyResponse.json();
      console.log('Email verification result:', verifyData);
      
      if (verifyData.success) {
        // Test registration completion
        console.log('👤 Testing user registration...');
        const registerResponse = await fetch('http://localhost:8080/api/auth/complete-registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            username: 'testuser123',
            name: 'Test User',
            password: 'TestPassword123!'
          }),
        });
        
        const registerData = await registerResponse.json();
        console.log('Registration result:', registerData);
        
        if (registerData.success) {
          console.log('✅ Signup flow test successful!');
          return registerData.user;
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Signup test error:', error);
  }
};

const testLogin = async () => {
  try {
    console.log('🔐 Testing login flow...');
    
    const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123!'
      }),
    });
    
    const loginData = await loginResponse.json();
    console.log('Login result:', loginData);
    
    if (loginData.success) {
      console.log('✅ Login flow test successful!');
      return loginData;
    }
    
  } catch (error) {
    console.error('❌ Login test error:', error);
  }
};

const testProfile = async (userId) => {
  try {
    console.log('👤 Testing profile API...');
    
    const profileResponse = await fetch(`http://localhost:8080/api/profile/${userId}`);
    const profileData = await profileResponse.json();
    console.log('Profile result:', profileData);
    
    if (profileData.success) {
      console.log('✅ Profile API test successful!');
      return profileData.profile;
    }
    
  } catch (error) {
    console.error('❌ Profile test error:', error);
  }
};

// Run tests
const runTests = async () => {
  console.log('🚀 Starting authentication flow tests...\n');
  
  const user = await testSignup();
  if (user) {
    await testLogin();
    await testProfile(user.id);
  }
  
  console.log('\n🏁 Tests completed!');
};

// Export for potential use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testSignup, testLogin, testProfile, runTests };
} else {
  // Browser environment - just log that we're ready
  console.log('✅ Auth test functions loaded. Ready to test!');
}
