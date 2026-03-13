import buildSystemPrompt from '../constants/aiSystemPrompt';
import { supabase } from '../../../core/api/supabaseClient';
import { AI_TOOL_DECLARATIONS } from './aiTools';

function extractTextFromParts(parts = []) {
  return parts
    .map((part) => (typeof part?.text === 'string' ? part.text.trim() : ''))
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

function extractFunctionCall(parts = []) {
  const callPart = parts.find((part) => part?.functionCall?.name);
  if (!callPart?.functionCall) return null;
  return {
    name: callPart.functionCall.name,
    args:
      callPart.functionCall.args &&
      typeof callPart.functionCall.args === 'object'
        ? callPart.functionCall.args
        : {},
  };
}

function buildRequestBody(history) {
  return {
    system_instruction: {
      parts: [{ text: buildSystemPrompt() }],
    },
    contents: history,
    tools: [{ function_declarations: AI_TOOL_DECLARATIONS }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1024,
    },
  };
}

export async function generateAssistantTurn(history) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase nao configurado.');
  }

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!session?.access_token) throw new Error('Usuario nao autenticado.');

  const response = await fetch(`${supabaseUrl}/functions/v1/gemini-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify(buildRequestBody(history)),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.error?.message || payload?.error || 'Falha ao consultar a Lei.A.';
    throw new Error(message);
  }

  const candidate = payload?.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  const functionCall = extractFunctionCall(parts);
  const text = extractTextFromParts(parts);

  return {
    functionCall,
    text,
    modelMessage: {
      role: 'model',
      parts: parts.length > 0 ? parts : [{ text: text || '' }],
    },
  };
}

export function createGeminiTextEntry(role, text) {
  return {
    role,
    parts: [{ text }],
  };
}

export function createGeminiFunctionResponse(name, result) {
  return {
    role: 'user',
    parts: [
      {
        functionResponse: {
          name,
          response: {
            result,
          },
        },
      },
    ],
  };
}