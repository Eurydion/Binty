/**
 * Provider-agnostic AI client (OpenAI & Azure OpenAI compatible).
 *
 * For standard OpenAI / OpenAI-compatible:
 *   EXPO_PUBLIC_AI_BASE_URL  – e.g. "https://api.openai.com/v1"
 *   EXPO_PUBLIC_AI_API_KEY   – your API key
 *   EXPO_PUBLIC_AI_MODEL     – model name (default: "gpt-4o-mini")
 *
 * For Azure OpenAI:
 *   EXPO_PUBLIC_AI_PROVIDER  – set to "azure"
 *   EXPO_PUBLIC_AI_BASE_URL  – e.g. "https://your-resource.openai.azure.com"
 *   EXPO_PUBLIC_AI_API_KEY   – your Azure API key
 *   EXPO_PUBLIC_AI_MODEL     – your deployment name
 *   EXPO_PUBLIC_AI_API_VERSION – API version (default: "2024-08-01-preview")
 */

const getProvider = () => process.env.EXPO_PUBLIC_AI_PROVIDER ?? 'openai';

const getBaseUrl = () =>
  process.env.EXPO_PUBLIC_AI_BASE_URL ?? 'https://api.openai.com/v1';

const getApiKey = () => process.env.EXPO_PUBLIC_AI_API_KEY ?? '';

const getModel = () => process.env.EXPO_PUBLIC_AI_MODEL ?? 'gpt-4o-mini';

const getApiVersion = () => process.env.EXPO_PUBLIC_AI_API_VERSION ?? '2024-08-01-preview';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  /** When true the assistant response is parsed as JSON. */
  json?: boolean;
}

interface OpenAIChoice {
  message: { role: string; content: string };
}

interface OpenAIResponse {
  choices: OpenAIChoice[];
}

function buildEndpointAndHeaders(): { url: string; headers: Record<string, string> } {
  const provider = getProvider();
  const baseUrl = getBaseUrl();
  const apiKey = getApiKey();

  if (provider === 'azure') {
    const deployment = getModel();
    const apiVersion = getApiVersion();
    return {
      url: `${baseUrl}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
    };
  }

  // Standard OpenAI / compatible
  return {
    url: `${baseUrl}/chat/completions`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  };
}

/**
 * Send a chat completion request and return the raw text response.
 */
export async function chatCompletion(opts: ChatCompletionOptions): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      'AI API key not configured. Set EXPO_PUBLIC_AI_API_KEY in your .env file.',
    );
  }

  const { url, headers } = buildEndpointAndHeaders();
  const provider = getProvider();

  console.log('[AI] Request URL:', url);
  console.log('[AI] Provider:', provider);

  const body: Record<string, unknown> = {
    messages: opts.messages,
    temperature: opts.temperature ?? 0.7,
  };

  // Azure uses max_completion_tokens, standard OpenAI uses max_tokens
  if (provider === 'azure') {
    body.max_completion_tokens = opts.maxTokens ?? 4096;
    body.model = getModel();
  } else {
    body.model = getModel();
    body.max_tokens = opts.maxTokens ?? 4096;
  }

  if (opts.json) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  console.log('[AI] Raw response:', JSON.stringify(data).slice(0, 500));
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI returned an empty response.');

  return content;
}

/**
 * Send a chat completion and parse the response as JSON of type T.
 */
export async function chatCompletionJSON<T>(opts: ChatCompletionOptions): Promise<T> {
  const raw = await chatCompletion({ ...opts, json: true });

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`Failed to parse AI JSON response: ${raw.slice(0, 200)}`);
  }
}
