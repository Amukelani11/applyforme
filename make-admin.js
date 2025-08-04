const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function makeUserAdmin(userEmail) {
  try {
    // First, find the user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', userEmail)
      .single();

    if (userError) {
      console.error('Error finding user:', userError);
      return;
    }

    if (!user) {
      console.error('User not found with email:', userEmail);
      return;
    }

    console.log('Found user:', user);

    // Update the user to be an admin
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ is_admin: true })
      .eq('id', user.id)
      .select();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return;
    }

    console.log('Successfully made user admin:', updateData);
    console.log('User is now an admin!');

  } catch (error) {
    console.error('Error:', error);
  }
}

// Replace 'your-email@example.com' with your actual email
makeUserAdmin('your-email@example.com'); 