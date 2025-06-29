const { createClient } = require('@supabase/supabase-js');

// Test the recruiter application API
async function testRecruiterAPI() {
  console.log('🧪 Testing Recruiter Application API...\n');

  const supabaseUrl = 'https://your-project.supabase.co'; // Replace with your Supabase URL
  const supabaseKey = 'your-anon-key'; // Replace with your anon key
  
  // For testing, we'll use the API endpoints directly
  const baseUrl = 'http://localhost:3000'; // Adjust if your app runs on different port

  try {
    // Test 1: Check if we can fetch applications for a job
    console.log('1. Testing job applications fetch...');
    
    const jobId = '1'; // Test with job ID 1
    const response = await fetch(`${baseUrl}/api/recruiter/jobs/${jobId}/applications`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Successfully fetched applications');
      console.log(`   - Candidate applications: ${data.candidateApplications?.length || 0}`);
      console.log(`   - Public applications: ${data.publicApplications?.length || 0}`);
    } else {
      console.log('❌ Failed to fetch applications:', response.status);
    }

    // Test 2: Check if we can fetch a specific application (if any exist)
    console.log('\n2. Testing specific application fetch...');
    
    // This would normally use a real application ID
    const applicationId = '1';
    const appResponse = await fetch(`${baseUrl}/api/recruiter/jobs/${jobId}/applications/${applicationId}?type=candidate`);
    
    if (appResponse.ok) {
      const appData = await appResponse.json();
      console.log('✅ Successfully fetched application details');
      console.log(`   - Candidate: ${appData.candidate?.user?.full_name || 'Unknown'}`);
      console.log(`   - AI Score: ${appData.ai_analysis?.overall_score || 'N/A'}%`);
      console.log(`   - Recommendation: ${appData.ai_analysis?.recommendation || 'N/A'}`);
    } else {
      console.log('❌ Failed to fetch application details:', appResponse.status);
      const errorData = await appResponse.text();
      console.log('   Error:', errorData);
    }

    console.log('\n🎉 API test completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Set up your GOOGLE_CLOUD_API_KEY environment variable');
    console.log('   2. Create some test job postings and applications');
    console.log('   3. Test the application review interface');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testRecruiterAPI();
}

module.exports = { testRecruiterAPI }; 