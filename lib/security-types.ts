export type SecurityData = {
  ip: string;
  threatScore: number;
  isVpn: boolean;
  vpnProviderNames: string[];
  vpnConfidenceScore: number;
  vpnLastSeen: string;
  isProxy: boolean;
  proxyProviderNames: string[];
  proxyConfidenceScore: number;
  proxyLastSeen: string;
  isResidentialProxy: boolean;
  isTor: boolean;
  isRelay: boolean;
  relayProviderName: string;
  isAnonymous: boolean;
  isKnownAttacker: boolean;
  isBot: boolean;
  isSpam: boolean;
  isCloudProvider: boolean;
  cloudProviderName: string;
};

export type SecurityResult =
  | {
      ok: true;
      cached: boolean;
      data: SecurityData;
    }
  | {
      ok: false;
      error: {
        title: string;
        message: string;
        status?: number;
        upgradeRequired?: boolean;
      };
    };
