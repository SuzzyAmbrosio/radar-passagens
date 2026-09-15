export interface AffiliateLinkService { createLink(offerUrl: string, partner: string): string; }
/** Placeholder: no tracking or link transformation is performed yet. */
export class PassthroughAffiliateLinkService implements AffiliateLinkService { createLink(offerUrl: string): string { return offerUrl; } }
