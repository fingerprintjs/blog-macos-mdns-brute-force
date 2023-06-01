import { ResolvedHostname, MDNSResolver } from "./types";

const IFRAME_TIMEOUT = 5000;
const IFRAME_INTERVAL = 200;
const IFRAME_BATCH_LIMIT = 100;

export const resolveLocalHostnamesWithIframe: MDNSResolver = async (
  candidates,
  onCandidateFound
) => {
  const resolvedHostnames: ResolvedHostname[] = [];
  const start = performance.now();

  for (let i = 0; i < candidates.length; i += IFRAME_BATCH_LIMIT) {
    const candidatesBatch = candidates.slice(i, i + IFRAME_BATCH_LIMIT);

    await Promise.all(
      candidatesBatch.map(
        (candidate) =>
          new Promise<void>((resolve) => {
            const iframe = document.createElement("iframe");
            iframe.src = `https://${candidate.hostname}./`;
            iframe.style.display = "none";

            const intervalId = setInterval(() => {
              if (!iframe.contentDocument) {
                const resolvedCandidate = {
                  ...candidate,
                  ping: performance.now() - start,
                };

                resolvedHostnames.push(resolvedCandidate);

                if (onCandidateFound) {
                  onCandidateFound(resolvedCandidate);
                }

                finish();
              }
            }, IFRAME_INTERVAL);

            setTimeout(() => {
              if (iframe.parentElement) {
                finish();
              }
            }, IFRAME_TIMEOUT);

            function finish() {
              if (iframe.parentElement) {
                clearInterval(intervalId);
                iframe.remove();
                resolve();
              }
            }

            document.body.appendChild(iframe);
          })
      )
    );
  }

  return resolvedHostnames.sort((a, b) => a.ping - b.ping);
};
