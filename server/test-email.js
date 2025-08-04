// Simple email test script
const { sendVerificationEmail } = require('./lib/email');

async function testEmail() {
  console.log('🧪 Testing email service...');
  
  const result = await sendVerificationEmail('test@example.com', '123456');
  
  console.log('📧 Email test result:', {
    success: result.success,
    error: result.error,
    messageId: result.messageId,
  });
  
  if (result.success) {
    console.log('✅ Email service is working correctly!');
  } else {
    console.log('❌ Email service has issues:', result.error);
  }
}

testEmail().catch(console.error);
