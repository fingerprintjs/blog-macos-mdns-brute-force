export async function resolveLocalHostnamesWithFetch(candidates: string[]) {
  const concurrencyLimit = 50;
  const detectedNames: string[] = [];

  for (let i = 0; i < candidates.length; i += concurrencyLimit) {
    const chunk = candidates.slice(i, i + concurrencyLimit);
    const abortController = new AbortController();

    setTimeout(() => {
      abortController.abort();
    }, 1000);

    await Promise.all(
      chunk.map((hostname) =>
        fetch(`https://${hostname}/`, { signal: abortController.signal })
          .then(() => detectedNames.push(hostname))
          .catch((error) => {
            if (error.name !== "AbortError") {
              detectedNames.push(hostname);
            }
          })
      )
    );
  }

  return detectedNames;
}
