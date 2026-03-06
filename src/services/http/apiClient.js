export async function postApiAction(action, payload = {}) {
  try {
    const response = await fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        error: data?.error || { message: `Falha na API: ${response.status}` },
      };
    }

    return data;
  } catch (error) {
    return { error: { message: error?.message || 'Falha de rede.' } };
  }
}
