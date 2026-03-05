import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function getRequesterProfile(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) return null;

  const { data: profile } = await supabase
    .from('usuarios')
    .select('role')
    .eq('auth_user_id', authData.user.id)
    .maybeSingle();

  return profile || null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const profile = await getRequesterProfile(req.headers.get('Authorization'));
  if (!profile || !['admin', 'master'].includes(String(profile.role || '').toLowerCase())) {
    return new Response(JSON.stringify({ error: 'Nao autorizado.' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('usuarios')
    .select('id, username, role, created_at, auth_user_id')
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
