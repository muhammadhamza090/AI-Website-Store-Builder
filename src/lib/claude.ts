import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-6";

const MODEL_ALIASES: Record<string, string> = {
  "claude-sonnet-4": "claude-sonnet-4-20250514",
  "claude-sonnet-4-6": DEFAULT_CLAUDE_MODEL,
  "claude-sonnet-4.6": DEFAULT_CLAUDE_MODEL,
  "claude-opus-4": "claude-opus-4-20250514",
  "claude-opus-4.7": "claude-opus-4-7-20250416"
};

function getClaudeKey() {
  const key = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY (or CLAUDE_API_KEY) is not set");
  return key;
}

export function getClaudeClient() {
  return new Anthropic({ apiKey: getClaudeKey() });
}

export function getClaudeModel() {
  const configuredModel =
    process.env.ANTHROPIC_MODEL ||
    process.env.CLAUDE_MODEL ||
    DEFAULT_CLAUDE_MODEL;

  return MODEL_ALIASES[configuredModel] || configuredModel;
}

export function extractClaudeText(response: {
  content: Array<{ type: string; text?: string }>;
}) {
  return response.content
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text ?? "")
    .join("\n")
    .trim();
}

/**
 * Attempt to repair truncated JSON by closing all open brackets/braces.
 * Handles the common case where Claude hits max_tokens mid-response.
 */
function repairTruncatedJson(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) return null;

  let repaired = trimmed;

  // If truncated mid-string value, close the string
  let inString = false;
  let lastCharWasEscape = false;
  for (let i = 0; i < repaired.length; i++) {
    const ch = repaired[i];
    if (lastCharWasEscape) {
      lastCharWasEscape = false;
      continue;
    }
    if (ch === "\\") {
      lastCharWasEscape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
    }
  }

  // If we ended inside a string, close it
  if (inString) {
    repaired += '"';
  }

  // Remove any trailing comma or incomplete key-value
  repaired = repaired.replace(/,\s*$/, "");
  repaired = repaired.replace(/,\s*"[^"]*"?\s*$/, "");
  repaired = repaired.replace(/:\s*$/, ': null');

  // Count open brackets and close them
  const stack: string[] = [];
  inString = false;
  lastCharWasEscape = false;
  for (let i = 0; i < repaired.length; i++) {
    const ch = repaired[i];
    if (lastCharWasEscape) {
      lastCharWasEscape = false;
      continue;
    }
    if (ch === "\\") {
      lastCharWasEscape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "[" || ch === "{") stack.push(ch);
    if (ch === "]" || ch === "}") stack.pop();
  }

  // Close all open brackets in reverse order
  while (stack.length > 0) {
    const open = stack.pop();
    repaired += open === "[" ? "]" : "}";
  }

  try {
    JSON.parse(repaired);
    return repaired;
  } catch {
    return null;
  }
}

export function parseClaudeJson<T>(text: string, label: string) {
  let cleaned = text.trim();

  // Remove everything before the first JSON character
  const firstJson = cleaned.search(/[\[{]/);
  if (firstJson > 0) {
    cleaned = cleaned.slice(firstJson);
  }

  // Remove markdown fences
  cleaned = cleaned.replace(/^```\w*\s*/gi, "");
  cleaned = cleaned.replace(/\s*```\s*/gi, "");
  cleaned = cleaned.trim();

  const candidates = new Set<string>([cleaned]);

  // Try extracting object
  const firstObject = cleaned.indexOf("{");
  const lastObject = cleaned.lastIndexOf("}");
  if (firstObject !== -1 && lastObject > firstObject) {
    candidates.add(cleaned.slice(firstObject, lastObject + 1));
  }

  // Try extracting array
  const firstArray = cleaned.indexOf("[");
  const lastArray = cleaned.lastIndexOf("]");
  if (firstArray !== -1 && lastArray > firstArray) {
    candidates.add(cleaned.slice(firstArray, lastArray + 1));
  }

  // First pass: try parsing as-is
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // Try fixing trailing commas
      try {
        const fixed = candidate.replace(/,\s*([\]}])/g, "$1");
        return JSON.parse(fixed) as T;
      } catch {
        // continue
      }
    }
  }

  // Second pass: try repairing truncated JSON
  const repaired = repairTruncatedJson(cleaned);
  if (repaired) {
    try {
      console.warn(`[${label}] Repaired truncated JSON (${cleaned.length} → ${repaired.length} chars)`);
      return JSON.parse(repaired) as T;
    } catch {
      // fall through
    }
  }

  console.error(`[${label}] JSON parse failed. Raw text (first 500 chars):`, text.slice(0, 500));
  throw new Error(`Failed to parse JSON from ${label} output`);
}

/**
 * Retry wrapper for Claude API calls that return JSON.
 */
export async function callClaudeWithRetry<T>(args: {
  label: string;
  createMessage: () => Promise<{ content: Array<{ type: string; text?: string }> }>;
  parseAndValidate: (text: string) => T;
  maxRetries?: number;
}): Promise<T> {
  const maxRetries = args.maxRetries ?? 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await args.createMessage();
      const text = extractClaudeText(res);

      if (!text || text.length < 10) {
        throw new Error(`Empty or too-short response from Claude (${text.length} chars)`);
      }

      return args.parseAndValidate(text);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt), 8000);
        console.warn(`[${args.label}] attempt ${attempt + 1} failed: ${lastError.message}. Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError ?? new Error(`${args.label} failed after ${maxRetries + 1} attempts`);
}

/**
 * Call Claude with streaming — avoids truncation issues with large responses.
 */
export async function callClaudeStreaming(args: {
  client: Anthropic;
  model: string;
  max_tokens: number;
  temperature: number;
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<string> {
  const stream = await args.client.messages.stream({
    model: args.model,
    max_tokens: args.max_tokens,
    temperature: args.temperature,
    system: args.system,
    messages: args.messages,
  });

  const response = await stream.finalMessage();
  return extractClaudeText(response);
}

/**
 * Call Claude with streaming and return JSON — best for nodes that generate large JSON.
 * Uses streaming to avoid truncation + automatic JSON repair.
 */
export async function callClaudeJsonStreaming<T>(args: {
  client: Anthropic;
  model: string;
  max_tokens: number;
  temperature: number;
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  label: string;
  validate: (data: unknown) => T;
  maxRetries?: number;
}): Promise<T> {
  const maxRetries = args.maxRetries ?? 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const text = await callClaudeStreaming({
        client: args.client,
        model: args.model,
        max_tokens: args.max_tokens,
        temperature: args.temperature,
        system: args.system,
        messages: args.messages,
      });

      if (!text || text.length < 10) {
        throw new Error(`Empty or too-short response (${text.length} chars)`);
      }

      const parsed = parseClaudeJson(text, args.label);
      return args.validate(parsed);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt), 8000);
        console.warn(`[${args.label}] attempt ${attempt + 1} failed: ${lastError.message}. Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError ?? new Error(`${args.label} failed after ${maxRetries + 1} attempts`);
}
