const { createClient } = require('@supabase/supabase-js');

// Use the same config as the app
const supabaseUrl = 'https://lkwtmfhxdjbwwjecghda.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrd3R0bWZoeGRqYnd3amVjZ2hkYSIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MzE5NzI5NzQsImV4cCI6MjA0NzU0ODk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  const userId = '683fce0d-2ce0-41de-a684-1e9ddf6ee1cf';
  
  try {
    console.log('Checking user:', userId);
    
    // Check public.users table
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    console.log('Public user data:', publicUser);
    if (publicError) {
      console.error('Public user error:', publicError);
      
      // If user doesn't exist, let's create them manually
      if (publicError.code === 'PGRST116') {
        console.log('User not found in public.users table. Creating...');
        
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: 'test@example.com', // We'll need to get this from auth
            full_name: 'Test User',
            subscription_status: 'trial',
            trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating user:', createError);
        } else {
          console.log('User created successfully:', newUser);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUser(); 