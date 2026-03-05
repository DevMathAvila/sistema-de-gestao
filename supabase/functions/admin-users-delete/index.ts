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
  if (!profile || String(profile.role || '').toLowerCase() !== 'master') {
    return new Response(JSON.stringify({ error: 'Nao autorizado.' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const body = await req.json().catch(() => ({}));
  const authUserId = String(body?.authUserId || '').trim();
  if (!authUserId) {
    return new Response(JSON.stringify({ error: 'ID invalido.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(authUserId);
  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  await supabase.from('usuarios').delete().eq('auth_user_id', authUserId);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
