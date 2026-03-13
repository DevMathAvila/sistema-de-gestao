import AI_SYSTEM_PROMPT from '../constants/aiSystemPrompt';
import { AI_TOOL_DECLARATIONS } from './aiTools';

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function getApiKey() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY nao configurada.');
  }
  return apiKey;
}

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
    args: callPart.functionCall.args && typeof callPart.functionCall.args === 'object'
      ? callPart.functionCall.args
      : {},
  };
}

function buildRequestBody(history) {
  return {
    system_instruction: {
      parts: [{ text: AI_SYSTEM_PROMPT }],
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
  const apiKey = getApiKey();
  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildRequestBody(history)),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || 'Falha ao consultar o Gemini.';
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
