// Test utility to verify user data integration
import { userDataService } from './user-data-service';

export async function testUserDataIntegration() {
  console.log('🧪 Testing user data integration...');
  
  // Test 1: Check if service is available
  try {
    const service = userDataService;
    console.log('✅ User data service is available:', service);
  } catch (error) {
    console.error('❌ User data service not available:', error);
    return false;
  }

  // Test 2: Check localStorage data
  try {
    const localData = localStorage.getItem('currentUser');
    if (localData) {
      const userData = JSON.parse(localData);
      console.log('✅ localStorage user data found:', userData);
    } else {
      console.log('ℹ️ No localStorage user data found');
    }
  } catch (error) {
    console.warn('⚠️ Failed to read localStorage:', error);
  }

  // Test 3: Check if MongoDB endpoints are accessible
  try {
    const testResponse = await fetch('/api/v1/users/me', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🔗 MongoDB endpoint test:', testResponse.status);
    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('✅ MongoDB endpoint working:', data);
    } else {
      console.log('ℹ️ MongoDB endpoint returned:', testResponse.status);
    }
  } catch (error) {
    console.warn('⚠️ MongoDB endpoint test failed:', error);
  }

  console.log('🧪 User data integration test completed');
  return true;
}

// Auto-run test in development
if (process.env.NODE_ENV === 'development') {
  // Run test after page load
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        testUserDataIntegration();
      }, 2000);
    });
  }
}
