import { ResolvedHostname, MDNSResolver } from "./types";

const FETCH_CONCURRENCY_LIMIT = 50;
const FETCH_RESOLVE_TIMEOUT = 700;

export const resolveLocalHostnamesWithFetch: MDNSResolver = async (
  candidates
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
      chunk.map(({ firstName, hostname }) =>
        fetch(`https://${hostname}/`, { signal: abortController.signal })
          .then(() => {
            throw new Error();
          })
          .catch((error) => {
            if (error.name !== "AbortError") {
              resolvedHostnames.push({
                firstName,
                hostname,
                ping: performance.now() - start,
              });
            }
          })
      )
    );
  }

  return resolvedHostnames.sort((a, b) => a.ping - b.ping);
};
