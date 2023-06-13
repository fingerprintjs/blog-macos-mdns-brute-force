import { resolveLocalHostnamesWithFetch } from "./fetch";
import { resolveLocalHostnamesWithIframe } from "./iframe";

export const mdnsResolvers = {
  fetch: resolveLocalHostnamesWithFetch,
  iframe: resolveLocalHostnamesWithIframe,
};
