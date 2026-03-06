import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const EMAIL_DOMAIN = 'lenovo.app';
const ALLOWED_ROLES = new Set(['master', 'admin', 'tecnico', 'colaborador', 'runin_kiosk']);

function normalizeUsername(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '');
}

function toEmail(username: string) {
  const normalized = normalizeUsername(username);
  if (!normalized) return '';
  return `${normalized}@${EMAIL_DOMAIN}`;
}

function inferRuninSetorFromUsername(username: string) {
  const normalized = normalizeUsername(username).replace(/[\s._-]+/g, '');
  const match = normalized.match(/^runin0?([1-9]|10)$/);
  if (!match) return null;
  const runinNum = Number(match[1]);
  if (!Number.isInteger(runinNum) || runinNum < 1 || runinNum > 10) return null;
  return `Runin ${String(runinNum).padStart(2, '0')}`;
}

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

async function findAuthUserByEmail(email: string) {
  // Compatibilidade: nem todo runtime expõe getUserByEmail.
  const maybeFn = (supabase.auth.admin as unknown as { getUserByEmail?: (e: string) => Promise<{ data?: { user?: { id: string } } }> }).getUserByEmail;
  if (typeof maybeFn === 'function') {
    const { data } = await maybeFn(email);
    return data?.user || null;
  }

  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return null;
  const users = Array.isArray(data?.users) ? data.users : [];
  const target = email.toLowerCase();
  return users.find((u) => String(u.email || '').toLowerCase() === target) || null;
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

  const body = await req.json().catch(() => ({}));
  const rawUsername = String(body?.username || '');
  const rawPassword = String(body?.senha || body?.password || '');
  const rawRole = String(body?.role || 'tecnico').toLowerCase();
  const rawSetorFixo = String(body?.setor_fixo || '').trim();

  const username = rawUsername.trim();
  const email = toEmail(rawUsername);
  const inferredSetorFixo = inferRuninSetorFromUsername(rawUsername);
  const requesterRole = String(profile.role || '').toLowerCase();
  const requestedRole = inferredSetorFixo ? 'runin_kiosk' : rawRole;
  const role = ALLOWED_ROLES.has(requestedRole) ? requestedRole : 'tecnico';
  const setorFixo = role === 'runin_kiosk' ? (inferredSetorFixo || rawSetorFixo) : null;

  if ((role === 'admin' || role === 'master') && requesterRole !== 'master') {
    return new Response(JSON.stringify({ error: 'Apenas master pode criar admin/master.' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!username || !email || rawPassword.length < 6) {
    return new Response(JSON.stringify({ error: 'Dados invalidos.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (role === 'runin_kiosk' && !setorFixo) {
    return new Response(JSON.stringify({ error: 'setor_fixo obrigatorio para runin_kiosk.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const existing = await findAuthUserByEmail(email);
  if (existing) {
    return new Response(JSON.stringify({ error: 'Usuario ja existe.' }), {
      status: 409,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: rawPassword,
    email_confirm: true,
  });

  if (createError || !created?.user) {
    return new Response(JSON.stringify({ error: createError?.message || 'Falha ao criar usuario.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { error: insertError } = await supabase
    .from('usuarios')
    .insert([{ username, role, auth_user_id: created.user.id, force_password_change: true, setor_fixo: setorFixo }]);

  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true, authUserId: created.user.id }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
