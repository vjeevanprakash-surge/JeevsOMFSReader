/**
 * Serialises requests per host so each API's rate limit is respected (minIntervalMs = 0 runs in
 * parallel), and retries on HTTP 429 / 5xx with exponential backoff.
 */
const queues = new Map<string, Promise<unknown>>();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url: string, init?: RequestInit): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, init);
    } catch (e) {
      // A 429 without CORS headers surfaces as a network TypeError: retry those too.
      if (attempt < 2 && navigator.onLine) {
        await sleep(1500 * 2 ** attempt);
        continue;
      }
      throw e;
    }
    if ((res.status === 429 || res.status >= 500) && attempt < 3) {
      await sleep(1000 * 2 ** attempt);
      continue;
    }
    return res;
  }
}

export async function limitedFetch(url: string, minIntervalMs: number, init?: RequestInit): Promise<Response> {
  const host = new URL(url).host;
  if (minIntervalMs === 0) {
    const res = await fetchWithRetry(url, init);
    if (!res.ok) throw new Error(`${host} responded ${res.status}`);
    return res;
  }
  const prev = queues.get(host) ?? Promise.resolve();
  const run = prev.then(() => fetchWithRetry(url, init));
  // Next request on this host waits for this one plus the interval, even if this one failed.
  queues.set(host, run.catch(() => undefined).then(() => sleep(minIntervalMs)));
  const res = await run;
  if (!res.ok) throw new Error(`${host} responded ${res.status}`);
  return res;
}
