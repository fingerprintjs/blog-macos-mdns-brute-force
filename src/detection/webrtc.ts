import { ResolvedHostname, MDNSResolver, MDNSCandidate } from "./types";

const WEBRTC_TIMEOUT = 500;
const WEBRTC_BATCH_MAX = 10;

export const resolveLocalHostnamesWithWebRTC: MDNSResolver = async (
  mdnsCandidates,
  onCandidateFound
) => {
  const resolvedHostnames: ResolvedHostname[] = [];

  for (let i = 0; i < mdnsCandidates.length; i += WEBRTC_BATCH_MAX) {
    const candidatesBatch = mdnsCandidates.slice(i, i + WEBRTC_BATCH_MAX);
    const channelLabel = Math.random().toString();
    const localPeerConnection = new RTCPeerConnection();
    const remotePeerConnection = new RTCPeerConnection();
    const dataChannel = localPeerConnection.createDataChannel(channelLabel);
    const start = performance.now();

    try {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          if (resolvedHostnames.length === 0) {
            resolve();
          }
        }, WEBRTC_TIMEOUT);

        localPeerConnection.createOffer().then((offer) => {
          localPeerConnection.setLocalDescription(offer);
        });

        localPeerConnection.onicegatheringstatechange = (e) => {
          if (localPeerConnection.iceGatheringState === "complete") {
            const modifiedOffer = getModifiedSessionDescription(
              localPeerConnection.localDescription,
              candidatesBatch
            );

            remotePeerConnection
              .setRemoteDescription(modifiedOffer)
              .then(() => remotePeerConnection.createAnswer())
              .then((answer) => {
                remotePeerConnection.setLocalDescription(answer);
              });
          }
        };

        remotePeerConnection.onicegatheringstatechange = function () {
          if (remotePeerConnection.iceGatheringState === "complete") {
            const modifiedOffer = getModifiedSessionDescription(
              remotePeerConnection.localDescription,
              candidatesBatch
            );

            localPeerConnection.setRemoteDescription(modifiedOffer);
          }
        };

        remotePeerConnection.onconnectionstatechange = async function () {
          if (remotePeerConnection.connectionState === "connected") {
            const transport = remotePeerConnection.sctp?.transport
              .iceTransport as any;

            const candidate = {
              ...candidatesBatch[
                transport.getSelectedCandidatePair().remote.foundation
              ],
              ping: performance.now() - start,
            };
            resolvedHostnames.push(candidate);

            if (onCandidateFound) {
              onCandidateFound(candidate);
            }

            resolve();
          }
        };
      });
    } finally {
      dataChannel.close();
      remotePeerConnection.close();
      localPeerConnection.close();
    }
  }

  return resolvedHostnames;
};

function getModifiedSessionDescription(
  sessionDescription: RTCSessionDescription | null,
  mdnsCandidates: MDNSCandidate[]
) {
  if (!sessionDescription) {
    throw new Error("Expected session description");
  }

  const lineBreak = sessionDescription.sdp.includes("\r\n") ? "\r\n" : "\n";

  return new RTCSessionDescription({
    sdp: sessionDescription.sdp.replaceAll(
      /^a=candidate:(\d+) (\d+) (\w+) (\d+) (.*?) (\d+) (.*?)$/gm,
      (_, _foundation, componentId, protocol, priority, address, port, rest) =>
        mdnsCandidates
          .map(
            (candidate, i) =>
              `a=candidate:${i} ${componentId} ${protocol} ${priority} ${candidate.hostname} ${port} ${rest}`
          )
          .join(lineBreak)
    ),
    type: sessionDescription.type,
  });
}
