export default async function handler(_req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(410).json({
    error: {
      message: 'API legada desativada. O projeto usa Supabase diretamente pelo frontend e por Edge Functions.',
    },
  });
}
