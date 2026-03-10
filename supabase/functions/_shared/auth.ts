import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

type RequesterProfile = {
  role: string | null;
};

export async function getRequesterProfile(
  supabase: SupabaseClient,
  authHeader: string | null,
): Promise<RequesterProfile | null> {
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) return null;

  const authUserId = authData.user.id;
  const authEmail = String(authData.user.email || '').toLowerCase();

  const { data: byAuthId } = await supabase
    .from('usuarios')
    .select('id, role, auth_user_id, username')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (byAuthId) {
    return { role: byAuthId.role || null };
  }

  const usernameFromEmail = authEmail.split('@')[0];
  if (!usernameFromEmail) return null;

  const { data: byUsername } = await supabase
    .from('usuarios')
    .select('id, role, auth_user_id, username')
    .ilike('username', usernameFromEmail)
    .maybeSingle();

  if (!byUsername) return null;

  if (!byUsername.auth_user_id || byUsername.auth_user_id !== authUserId) {
    await supabase
      .from('usuarios')
      .update({ auth_user_id: authUserId })
      .eq('id', byUsername.id);
  }

  return { role: byUsername.role || null };
}
