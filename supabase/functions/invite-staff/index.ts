import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

console.log('Function top level: Script loaded.');

// CORS headers to allow requests from your frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // IMPORTANT: Replace with your frontend URL in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Main server function
serve(async (req) => {
  console.log('Request received:', { method: req.method });

  // This is needed for CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Attempting to create Supabase admin client...');
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    console.log('Supabase admin client created successfully.');

    console.log('Attempting to parse request body...');
    const { barberData } = await req.json();
    console.log('Request body parsed.');
    
    if (!barberData) {
        throw new Error('Request body is missing "barberData" object.');
    }
    const { email, name, phone_number_work, phone_number_home, home_address } = barberData;

    if (!email) throw new Error('Email is required in barberData.');
    if (!name) throw new Error('Name is required in barberData.');

    console.log(`Inviting user: ${email}`);
    const { data: { user: invitedUser }, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      { app_metadata: { role: 'staff' } }
    );

    if (inviteError) throw inviteError;
    if (!invitedUser) throw new Error('Could not create user after invite.');
    console.log(`User ${invitedUser.id} invited successfully.`);

    console.log(`Creating profile for user: ${invitedUser.id}`);
    const { error: profileError } = await supabaseAdmin.from('barbers').insert({
      user_id: invitedUser.id,
      email: invitedUser.email,
      name,
      phone_number_work,
      phone_number_home,
      home_address,
      is_active: true
    });

    if (profileError) throw profileError;
    console.log('Profile created successfully.');

    return new Response(
      JSON.stringify({ message: 'Barber invited and profile created successfully!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('!!! Critical error in function !!!:', error);

    // Check for the specific "user already exists" error from Supabase Auth
    if (error.code === 'email_exists') {
      return new Response(
        JSON.stringify({ 
            error: 'User already registered.',
            details: 'This email address is already in use. Please use a different email.'
        }),
        // 409 Conflict is a more appropriate HTTP status for this error
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
      );
    }

    return new Response(
      JSON.stringify({ 
          error: 'An internal error occurred in the function.',
          details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}); 