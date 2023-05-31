export type ResolvedHostname = {
  firstName?: string;
  hostname: string;
  ping: number;
};

export type MDNSCandidate = {
  firstName?: string;
  hostname: string;
};

export interface MDNSResolver {
  (candidates: MDNSCandidate[]): Promise<ResolvedHostname[]>;
}
