import { handleApiRequest } from '../server/api/handler.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: { message: 'Metodo nao permitido.' } });
  }

  const { status, body } = await handleApiRequest(req.body);
  return res.status(status).json(body);
}
