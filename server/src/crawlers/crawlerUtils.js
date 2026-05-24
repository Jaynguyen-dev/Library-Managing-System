export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryFetch(fn, retries = 3, baseDelayMs = 1000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await delay(baseDelayMs * 2 ** attempt);
    }
  }
}

export function sanitizeText(raw) {
  if (!raw) return null;
  return raw.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();
}
