const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
// Get these from your .env.local file or Supabase dashboard
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lkwtmfhxdjbwwjecghda.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUser() {
  const userId = '683fce0d-2ce0-41de-a684-1e9ddf6ee1cf';
  
  try {
    console.log('Fixing user data for:', userId);
    
    // Insert the user into the users table
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: 'user@example.com', // You can update this later
        full_name: 'Test User',
        subscription_status: 'trial',
        trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // Unique violation
        console.log('User already exists, updating...');
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            email: 'user@example.com',
            full_name: 'Test User',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();
        
        if (updateError) {
          console.error('Error updating user:', updateError);
        } else {
          console.log('User updated successfully:', updatedUser);
        }
      } else {
        console.error('Error creating user:', error);
      }
    } else {
      console.log('User created successfully:', data);
    }
    
    // Verify the user exists
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (verifyError) {
      console.error('Error verifying user:', verifyError);
    } else {
      console.log('User verified:', verifyUser);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixUser(); 