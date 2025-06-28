#!/usr/bin/env node

/**
 * Test script for Google Analytics functionality
 * Run with: node scripts/test-analytics.js
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

if (!GA_ID) {
  console.error('❌ NEXT_PUBLIC_GA_ID environment variable not set');
  console.error('Please set your Google Analytics Measurement ID');
  console.error('Example: NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX');
  process.exit(1);
}

console.log('✅ Google Analytics Configuration:');
console.log(`   Measurement ID: ${GA_ID}`);
console.log('   Status: Configured');
console.log('\n📊 To verify tracking is working:');
console.log('1. Open your website in a browser');
console.log('2. Open Developer Tools (F12)');
console.log('3. Go to Network tab');
console.log('4. Look for requests to googletagmanager.com');
console.log('5. Check Google Analytics Real-time reports');
console.log('\n🎯 Custom Events Available:');
console.log('   - Job Posted (recruiters)');
console.log('   - Job Applied (candidates)');
console.log('   - Sign Up (candidates/recruiters)');
console.log('   - Sign In (candidates/recruiters)');
console.log('   - CV Upload (candidates)');
console.log('   - CV Review (candidates)');
console.log('   - Pricing View (engagement)');
console.log('   - Contact Form (engagement)');
console.log('\n📈 Next Steps:');
console.log('1. Deploy your application');
console.log('2. Visit different pages to test page views');
console.log('3. Perform actions to test custom events');
console.log('4. Check Google Analytics dashboard for data');
console.log('\n🔧 Troubleshooting:');
console.log('- Ensure NEXT_PUBLIC_GA_ID is set in production');
console.log('- Check browser console for any errors');
console.log('- Verify ad blockers are not blocking analytics');
console.log('- Wait 24-48 hours for data to appear in reports'); 