const { createClient } = require('@supabase/supabase-js');

// Use the anon key for testing
const supabaseUrl = 'https://lkwtmfhxdjbwwjecghda.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrd3R0bWZoeGRqYnd3amVjZ2hkYSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQ4Nzk0NzExLCJleHAiOjIwNjQzNzA3MTF9.HHFczTkx_KqrfME3M-9YOw9nxutkWi5T7OTpEpzclhM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuth() {
  try {
    console.log('Checking authentication status...');
    
    // Check if there's a session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return;
    }
    
    if (session) {
      console.log('✅ User is authenticated');
      console.log('User ID:', session.user.id);
      console.log('User email:', session.user.email);
      console.log('Session expires:', new Date(session.expires_at * 1000).toLocaleString());
    } else {
      console.log('❌ No active session found');
      console.log('User needs to sign in');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAuth(); 