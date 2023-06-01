import { resolveLocalHostnamesWithFetch } from "./fetch";
import { resolveLocalHostnamesWithIframe } from "./iframe";
import { resolveLocalHostnamesWithWebRTC } from "./webrtc";

export const mdnsResolvers = {
  webrtc: resolveLocalHostnamesWithWebRTC,
  fetch: resolveLocalHostnamesWithFetch,
  iframe: resolveLocalHostnamesWithIframe,
};
