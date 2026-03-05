import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL_DOMAIN = 'lenovo.app';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const normalizeUsername = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '');

const toEmail = (username) => {
  const normalized = normalizeUsername(username);
  if (!normalized) return '';
  return `${normalized}@${EMAIL_DOMAIN}`;
};

const dryRun = String(process.env.DRY_RUN || '') === '1';

const { data: usuarios, error } = await supabase
  .from('usuarios')
  .select('id, username, senha, role, auth_user_id');

if (error) {
  console.error('Failed to load usuarios:', error.message);
  process.exit(1);
}

const emailSeen = new Set();
const adminBase = `${SUPABASE_URL}/auth/v1/admin/users`;
const adminHeaders = {
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  apikey: SERVICE_ROLE_KEY,
  'Content-Type': 'application/json',
};

async function adminGetUserByEmail(email) {
  if (supabase.auth?.admin?.getUserByEmail) {
    const { data } = await supabase.auth.admin.getUserByEmail(email);
    return data?.user || null;
  }

  const res = await fetch(`${adminBase}?page=1&per_page=1000`, {
    method: 'GET',
    headers: adminHeaders,
  });
  if (!res.ok) return null;
  const payload = await res.json();
  const users = Array.isArray(payload?.users) ? payload.users : [];
  const target = String(email || '').trim().toLowerCase();
  return users.find((u) => String(u?.email || '').trim().toLowerCase() === target) || null;
}

async function adminGetUserById(userId) {
  if (!userId) return null;
  if (supabase.auth?.admin?.getUserById) {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error) return null;
    return data?.user || null;
  }

  const res = await fetch(`${adminBase}/${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: adminHeaders,
  });
  if (!res.ok) return null;
  const payload = await res.json().catch(() => ({}));
  return payload?.user || null;
}

async function adminCreateUser(email, password) {
  if (supabase.auth?.admin?.createUser) {
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) throw createError;
    return data?.user || null;
  }

  const res = await fetch(adminBase, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.msg || payload?.error_description || 'Falha ao criar usuario.');
  }
  return payload?.user || null;
}

async function adminUpdateUserCredentials(userId, email, password) {
  if (supabase.auth?.admin?.updateUserById) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      email,
      password,
      email_confirm: true,
    });
    if (updateError) throw updateError;
    return;
  }

  const res = await fetch(`${adminBase}/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.msg || payload?.error_description || 'Falha ao atualizar credenciais.');
  }
}

for (const user of usuarios || []) {
  const email = toEmail(user.username);
  const normalized = normalizeUsername(user.username);
  if (!email) {
    console.warn(`Skipping user with invalid username: ${user.username}`);
    continue;
  }
  if (normalized !== String(user.username || '').trim().toLowerCase()) {
    console.warn(`Username normalized: "${user.username}" -> "${normalized}". Login usara a forma normalizada.`);
  }
  if (emailSeen.has(email)) {
    console.warn(`Duplicate email derived from username: ${email}. Manual fix required.`);
    continue;
  }
  emailSeen.add(email);
}

for (const user of usuarios || []) {
  const email = toEmail(user.username);
  if (!email) {
    console.warn(`Skipping user with invalid username: ${user.username}`);
    continue;
  }

  if (!user.senha) {
    console.warn(`Skipping ${user.username} (missing senha).`);
    continue;
  }

  if (dryRun) {
    console.log(`[DRY RUN] Would create auth user for ${user.username} (${email}).`);
    continue;
  }

  let linkedUser = user.auth_user_id ? await adminGetUserById(user.auth_user_id) : null;
  if (!linkedUser) {
    linkedUser = await adminGetUserByEmail(email);
  }
  let authUserId = linkedUser?.id || null;

  if (!authUserId) {
    try {
      const createdUser = await adminCreateUser(email, user.senha);
      authUserId = createdUser?.id || null;
    } catch (err) {
      console.error(`Failed to create auth user for ${user.username}:`, err?.message);
      continue;
    }
  }

  if (dryRun) {
    console.log(`[DRY RUN] Would sync credentials for ${user.username} (${email}).`);
  } else {
    try {
      await adminUpdateUserCredentials(authUserId, email, user.senha);
    } catch (err) {
      console.error(`Failed to sync credentials for ${user.username}:`, err?.message);
      continue;
    }
  }

  const { error: updateError } = await supabase
    .from('usuarios')
    .update({ auth_user_id: authUserId })
    .eq('id', user.id);

  if (updateError) {
    console.error(`Failed to update profile for ${user.username}:`, updateError.message);
    continue;
  }

  console.log(`Migrated ${user.username} -> ${authUserId} (${email})`);
}

console.log('Done.');
