import { ResolvedHostname, MDNSResolver } from "./types";

const IFRAME_TIMEOUT = 2000;
const IFRAME_INTERVAL = 400;

export const resolveLocalHostnamesWithIframe: MDNSResolver = async (
  candidates
) => {
  const resolvedHostnames: ResolvedHostname[] = [];
  const start = performance.now();

  await Promise.all(
    candidates.map(
      (candidate) =>
        new Promise<void>((resolve) => {
          const iframe = document.createElement("iframe");
          iframe.src = `https://${candidate.hostname}./`; // tor hack
          iframe.style.display = "none";

          const intervalId = setInterval(() => {
            if (!iframe.contentDocument) {
              resolvedHostnames.push({
                ...candidate,
                ping: performance.now() - start,
              });

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

  return resolvedHostnames.sort((a, b) => a.ping - b.ping);
};
