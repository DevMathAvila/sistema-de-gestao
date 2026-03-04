import { criarAviso, listarAvisos } from '../../../core/api/supabaseSecure';

export function formatarDataHoje() {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date());
}

export function mapAviso(raw) {
  return {
    id: raw?.id ?? `${raw?.created_at || ''}-${raw?.titulo || ''}`,
    titulo: raw?.titulo || raw?.title || 'Aviso interno',
    mensagem: raw?.mensagem || raw?.conteudo || raw?.texto || '-',
    autor: raw?.autor || raw?.created_by || 'Sistema',
    createdAt: raw?.created_at || raw?.data || null,
  };
}

export function getUrgencia(aviso) {
  const texto = `${aviso.titulo} ${aviso.mensagem}`.toLowerCase();
  if (/critic|urgen|parada|imediat/.test(texto)) return { kind: 'critica' };
  if (/alerta|atenc|risco/.test(texto)) return { kind: 'alerta' };
  return { kind: 'info' };
}

export async function carregarAvisos() {
  const { data, error } = await listarAvisos();
  if (error) throw error;
  return (data || []).map(mapAviso);
}

export async function publicarAviso(payload) {
  const { error } = await criarAviso(payload);
  if (error) throw error;
}
