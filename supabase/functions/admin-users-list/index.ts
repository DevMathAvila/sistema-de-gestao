import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getRequesterProfile } from '../_shared/auth.ts';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const profile = await getRequesterProfile(supabase, req.headers.get('Authorization'));
  if (!profile || !['admin', 'master'].includes(String(profile.role || '').toLowerCase())) {
    return new Response(JSON.stringify({ error: 'Nao autorizado.' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('usuarios')
    .select('id, username, role, setor_fixo, created_at, auth_user_id')
    .order('username');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ users: data || [] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
