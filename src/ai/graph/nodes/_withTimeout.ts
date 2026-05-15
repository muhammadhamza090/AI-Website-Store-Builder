export async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  // AI_NODE_TIMEOUT_MS caps per-node timeouts, but never below 60 seconds.
  // The HTML builder needs up to 5 minutes — do not cap it too low.
  const envMs = Number(process.env.AI_NODE_TIMEOUT_MS);
  const effectiveMs =
    Number.isFinite(envMs) && envMs > 0
      ? Math.max(Math.min(ms, envMs), 60_000) // never less than 60s
      : ms;

  let timeoutId: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<T>((_resolve, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`${label} timed out after ${effectiveMs}ms`)),
      effectiveMs
    );
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
