import { ResolvedHostname, MDNSResolver } from "./types";

const FETCH_CONCURRENCY_LIMIT = 15;
const FETCH_RESOLVE_TIMEOUT = 1000;
const FETCH_RESOLVE_THRESHOLD = 100;

export const resolveLocalHostnamesWithFetch: MDNSResolver = async (
  candidates,
  onCandidateFound
) => {
  const resolvedHostnames: ResolvedHostname[] = [];

  for (let i = 0; i < candidates.length; i += FETCH_CONCURRENCY_LIMIT) {
    const chunk = candidates.slice(i, i + FETCH_CONCURRENCY_LIMIT);
    const abortController = new AbortController();
    const start = performance.now();

    setTimeout(() => {
      abortController.abort();
    }, FETCH_RESOLVE_TIMEOUT);

    await Promise.all(
      chunk.map(async ({ firstName, hostname }) => {
        const firstProbe = await resolveHostname(hostname);
        if (firstProbe < FETCH_RESOLVE_TIMEOUT) {
          const secondProbe = await resolveHostname(hostname);

          if (
            secondProbe < firstProbe &&
            secondProbe < FETCH_RESOLVE_THRESHOLD
          ) {
            const candidate = {
              firstName,
              hostname,
              ping: secondProbe,
            };

            resolvedHostnames.push(candidate);

            if (onCandidateFound) {
              onCandidateFound(candidate);
            }
          }
        }
      })
    );

    // Wait between chunks
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return resolvedHostnames.sort((a, b) => a.ping - b.ping);
};

async function resolveHostname(hostname: string) {
  const abortController = new AbortController();
  const start = performance.now();

  setTimeout(() => {
    abortController.abort();
  }, FETCH_RESOLVE_TIMEOUT);

  await fetch(`https://${hostname}/`, { signal: abortController.signal })
    .then()
    .catch((_) => {
      /* Do nothing */
    });

  return performance.now() - start;
}
