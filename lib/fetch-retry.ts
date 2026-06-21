// Thin wrapper around fetch that retries on transient network failures
// (thrown errors / dropped connections), which occasionally happen on cold
// upstream connections to third-party APIs like TMDB. HTTP error *responses*
// (non-2xx) are returned as-is — callers decide how to handle those.
export async function fetchWithRetry(
  input: string,
  init?: RequestInit & { next?: { revalidate?: number } },
  retries = 2,
  backoffMs = 250
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fetch(input, init);
    } catch (error) {
      lastError = error;
      // Don't wait after the final attempt.
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, backoffMs * (attempt + 1)));
      }
    }
  }
  throw lastError;
}
