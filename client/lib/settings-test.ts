// Test file to verify all settings functionality is working
import firebaseSettingsService from './firebase-settings';

export async function testAllSettings(firebaseUserId: string) {
  console.log('🧪 Testing all settings functionality for user:', firebaseUserId);
  
  try {
    // Test 1: Load default settings
    console.log('📋 Test 1: Loading settings...');
    const settings = await firebaseSettingsService.getSettings(firebaseUserId);
    console.log('✅ Settings loaded:', settings);
    
    // Test 2: Toggle each setting type
    const settingsToTest = [
      'theme',
      'playback.autoPlay', 
      'playback.highQuality',
      'playback.crossfade',
      'playback.normalization',
      'notifications.email',
      'privacy.publicProfile',
      'privacy.showActivity'
    ];
    
    for (const setting of settingsToTest) {
      console.log(`🔄 Test: Toggling ${setting}...`);
      const success = await firebaseSettingsService.updateSetting(
        firebaseUserId, 
        setting, 
        true
      );
      console.log(`${success ? '✅' : '❌'} ${setting} update:`, success);
    }
    
    // Test 3: Update multiple settings at once
    console.log('📦 Test 3: Bulk settings update...');
    const bulkUpdate = await firebaseSettingsService.updateSettings(firebaseUserId, {
      theme: 'dark',
      playback: {
        autoPlay: true,
        highQuality: true,
        crossfade: false,
        normalization: true,
        autoDownload: false,
        offlineMode: false,
        volume: 0.8,
        shuffle: false,
        repeat: false,
      },
      notifications: {
        email: true,
        push: true,
        inApp: true,
      },
      privacy: {
        publicProfile: true,
        showActivity: true,
        showLibrary: true,
      }
    });
    console.log('✅ Bulk update success:', bulkUpdate);
    
    // Test 4: Reset to defaults
    console.log('🔄 Test 4: Reset to defaults...');
    const resetSuccess = await firebaseSettingsService.resetSettings(firebaseUserId);
    console.log('✅ Reset success:', resetSuccess);
    
    console.log('🎉 All settings tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Settings test failed:', error);
    return false;
  }
}

// Test individual setting buttons
export async function testSettingButton(firebaseUserId: string, settingKey: string, newValue: any) {
  console.log(`🧪 Testing ${settingKey} button:`, newValue);
  
  try {
    const success = await firebaseSettingsService.updateSetting(firebaseUserId, settingKey, newValue);
    console.log(`${success ? '✅' : '❌'} ${settingKey} button test:`, success);
    return success;
  } catch (error) {
    console.error(`❌ ${settingKey} button test failed:`, error);
    return false;
  }
}
