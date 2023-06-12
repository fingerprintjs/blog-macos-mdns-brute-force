import { ResolvedHostname, MDNSResolver, MDNSCandidate } from "./types";

const IFRAME_TIMEOUT = 500;
const IFRAME_BATCH_LIMIT = 10;
const IFRAME_RESOLVE_THRESHOLD = 300;

export const resolveLocalHostnamesWithIframe: MDNSResolver = async (
  candidates,
  onCandidateFound
) => {
  const resolvedHostnames: ResolvedHostname[] = [];

  for (let i = 0; i < candidates.length; i += IFRAME_BATCH_LIMIT) {
    const candidatesBatch = candidates.slice(i, i + IFRAME_BATCH_LIMIT);

    await Promise.all(
      candidatesBatch.map((candidate) =>
        handleIframeCandidate(candidate, resolvedHostnames, onCandidateFound)
      )
    );
  }

  return resolvedHostnames.sort((a, b) => a.ping - b.ping);
};

async function handleIframeCandidate(
  candidate: MDNSCandidate,
  resolvedHostnames: ResolvedHostname[],
  onCandidateFound: (candidate: ResolvedHostname) => unknown
) {
  const iframe = document.createElement("iframe");
  const src = `https://${candidate.hostname}/`;

  iframe.src = "about:blank";
  iframe.style.display = "none";

  document.body.appendChild(iframe);

  const firstProbe = await Promise.race([
    wait(IFRAME_TIMEOUT),
    measureHostnameResolveTime(iframe, src),
  ]);

  // Reload frame
  iframe.contentWindow!.location = "about:blank";
  await wait(100);

  const secondProbe = await Promise.race([
    wait(IFRAME_TIMEOUT),
    measureHostnameResolveTime(iframe, src),
  ]);

  if (secondProbe < firstProbe && secondProbe < IFRAME_RESOLVE_THRESHOLD) {
    const resolvedCandidate = {
      ...candidate,
      ping: secondProbe,
    };

    onCandidateFound(resolvedCandidate);
    resolvedHostnames.push(resolvedCandidate);
  }

  iframe.remove();
}

async function wait(ms: number) {
  return new Promise<number>((resolve) => {
    setTimeout(() => resolve(ms), ms);
  });
}

async function measureHostnameResolveTime(
  iframe: HTMLIFrameElement,
  src: string
) {
  return new Promise<number>((resolve) => {
    const start = performance.now();

    iframe.contentWindow!.location = src;
    iframe.contentWindow!.onunload = () => {
      // avoid errors during window unload
      setTimeout(() => {
        resolve(performance.now() - start);
      });
    };
  });
}
