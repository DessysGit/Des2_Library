/**
 * Test Email Service
 * 
 * Run this script to verify your email service is working
 * Usage: node test-email.js your.email@example.com
 */

require('dotenv').config();
const { sendVerificationEmail } = require('./backend/services/emailService');

const testEmail = process.argv[2];

if (!testEmail) {
  console.log('❌ Please provide an email address to test');
  console.log('Usage: node test-email.js your.email@example.com');
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('📧 EMAIL SERVICE TEST');
console.log('='.repeat(60) + '\n');

console.log(`🎯 Testing email to: ${testEmail}`);
console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log('');

// Check which service is configured
if (process.env.RESEND_API_KEY) {
  console.log('✅ Using: Resend');
  console.log(`📨 From: ${process.env.EMAIL_FROM || 'onboarding@resend.dev'}`);
} else if (process.env.GMAIL_USER) {
  console.log('✅ Using: Gmail SMTP');
  console.log(`📨 From: ${process.env.GMAIL_USER}`);
} else if (process.env.BREVO_API_KEY) {
  console.log('✅ Using: Brevo');
  console.log(`📨 From: ${process.env.EMAIL_FROM}`);
} else if (process.env.SENDGRID_API_KEY) {
  console.log('⚠️  Using: SendGrid (may not work if trial expired)');
  console.log(`📨 From: ${process.env.SENDGRID_FROM_EMAIL}`);
} else {
  console.log('❌ No email service configured!');
  console.log('Please set up one of:');
  console.log('  - RESEND_API_KEY (recommended)');
  console.log('  - GMAIL_USER + GMAIL_APP_PASSWORD');
  console.log('  - BREVO_API_KEY');
  process.exit(1);
}

console.log('');
console.log('🔄 Sending test verification email...');
console.log('');

// Send test email
const testToken = 'test-token-' + Date.now();
sendVerificationEmail(testEmail, testToken, 'Test User')
  .then(success => {
    console.log('');
    console.log('='.repeat(60));
    if (success) {
      console.log('✅ TEST PASSED!');
      console.log('');
      console.log('📬 Check your email inbox (and spam folder)');
      console.log('💡 If you received the email, your service is working!');
    } else {
      console.log('❌ TEST FAILED!');
      console.log('');
      console.log('🔍 Check the error messages above for details');
      console.log('💡 Common issues:');
      console.log('   - Wrong API key');
      console.log('   - Missing environment variables');
      console.log('   - Service not configured properly');
    }
    console.log('='.repeat(60) + '\n');
  })
  .catch(error => {
    console.log('');
    console.log('='.repeat(60));
    console.log('❌ TEST FAILED WITH ERROR!');
    console.log('');
    console.error(error);
    console.log('');
    console.log('='.repeat(60) + '\n');
  });
