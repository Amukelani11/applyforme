const { createClient } = require('@supabase/supabase-js');

// Use the anon key for testing
const supabaseUrl = 'https://lkwtmfhxdjbwwjecghda.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrd3R0bWZoeGRqYnd3amVjZ2hkYSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQ4Nzk0NzExLCJleHAiOjIwNjQzNzA3MTF9.HHFczTkx_KqrfME3M-9YOw9nxutkWi5T7OTpEpzclhM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserCreation() {
  const userId = '683fce0d-2ce0-41de-a684-1e9ddf6ee1cf';
  
  try {
    console.log('Testing user creation for:', userId);
    
    // Try to get the user first
    const { data: existingUser, error: getError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (getError && getError.code === 'PGRST116') {
      console.log('User not found, creating...');
      
      // Try to create the user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: 'user@example.com',
          full_name: 'Test User',
          subscription_status: 'trial',
          trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating user:', createError);
        console.log('This might be due to RLS policies. The AI service should handle this automatically.');
      } else {
        console.log('User created successfully:', newUser);
      }
    } else if (getError) {
      console.error('Error getting user:', getError);
    } else {
      console.log('User already exists:', existingUser);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testUserCreation(); 