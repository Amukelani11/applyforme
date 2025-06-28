-- Create the Edge Function for CV analysis
create or replace function analyze_cv(cv_text text)
returns json
language plpgsql
security definer
as $$
declare
  service_account jsonb;
  token text;
  response jsonb;
begin
  -- Service account credentials should be configured as secrets in your Supabase project
  -- For local development, you might use placeholder values or a local secrets file.
  -- DO NOT COMMIT REAL CREDENTIALS
  service_account := jsonb_build_object(
    'type', 'service_account',
    'project_id', 'YOUR_PROJECT_ID',
    'private_key_id', 'YOUR_PRIVATE_KEY_ID',
    'private_key', 'YOUR_PRIVATE_KEY',
    'client_email', 'YOUR_CLIENT_EMAIL',
    'client_id', 'YOUR_CLIENT_ID',
    'auth_uri', 'https://accounts.google.com/o/oauth2/auth',
    'token_uri', 'https://oauth2.googleapis.com/token',
    'auth_provider_x509_cert_url', 'https://www.googleapis.com/oauth2/v1/certs',
    'client_x509_cert_url', 'YOUR_CLIENT_X509_CERT_URL',
    'universe_domain', 'googleapis.com'
  );

  -- Get access token using service account
  select content::json->>'access_token' into token
  from http_post(
    'https://oauth2.googleapis.com/token',
    jsonb_build_object(
      'grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      'assertion', jwt_sign(
        jsonb_build_object(
          'iss', service_account->>'client_email',
          'scope', 'https://www.googleapis.com/auth/cloud-platform',
          'aud', service_account->>'token_uri',
          'exp', extract(epoch from now() + interval '1 hour'),
          'iat', extract(epoch from now())
        ),
        service_account->>'private_key',
        'RS256'
      )
    )::text,
    'application/json'
  );

  -- Call Vertex AI API
  select content::jsonb into response
  from http_post(
    'https://us-central1-aiplatform.googleapis.com/v1/projects/gen-lang-client-0215820874/locations/us-central1/publishers/google/models/gemini-pro:generateContent',
    jsonb_build_object(
      'contents', jsonb_build_array(
        jsonb_build_object(
          'parts', jsonb_build_array(
            jsonb_build_object(
              'text', format(
                'Analyze this CV and provide a detailed analysis of its strengths and weaknesses. Focus on:
1. Education section
2. Work experience
3. Skills
4. Overall structure and formatting
5. Areas for improvement

CV Text:
%s

Provide your analysis in a structured format with specific recommendations for improvement.',
                cv_text
              )
            )
          )
        )
      )
    )::text,
    'application/json',
    array[
      array['Authorization', 'Bearer ' || token]
    ]
  );

  -- Return the analysis
  return json_build_object(
    'text', cv_text,
    'analysis', response->'candidates'->0->'content'->'parts'->0->>'text'
  );
exception
  when others then
    raise exception 'Failed to analyze CV: %', SQLERRM;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function analyze_cv(text) to authenticated;

-- Create policies for cv_improvements table if they don't exist
do $$ 
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'cv_improvements' 
    and policyname = 'Users can view their own improvements'
  ) then
    create policy "Users can view their own improvements"
      on public.cv_improvements
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'cv_improvements' 
    and policyname = 'Users can insert their own improvements'
  ) then
    create policy "Users can insert their own improvements"
      on public.cv_improvements
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'cv_improvements' 
    and policyname = 'Users can update their own improvements'
  ) then
    create policy "Users can update their own improvements"
      on public.cv_improvements
      for update
      using (auth.uid() = user_id);
  end if;
end $$; 