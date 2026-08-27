import "server-only";

import { isIP } from "node:net";
import { cookies, headers } from "next/headers";

import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { getSessionCache, setSessionCache } from "@/lib/session-cache";
import type { SecurityData, SecurityResult } from "@/lib/security-types";

type JsonObject = Record<string, unknown>;

type ApiError = {
  message?: string;
  detail?: string;
};

// v3 is the primary endpoint; v2 is kept as a routing fallback.
const SECURITY_ENDPOINTS = [
  "https://api.ipgeolocation.io/v3/security",
  "https://api.ipgeolocation.io/v2/security",
];

export async function getMyIpSecurity(): Promise<SecurityResult> {
  const headerStore = await headers();
  const clientIp = getPublicClientIp(headerStore);

  return fetchSecurity({
    cacheKey: "self",
    ip: clientIp,
  });
}

export async function getIpSecurity(input: string): Promise<SecurityResult> {
  const ip = input.trim();

  if (!ip) {
    return createErrorResult(
      "Missing IP address",
      "Enter an IPv4 or IPv6 address to run the security check.",
    );
  }

  if (isIP(ip) === 0) {
    return createErrorResult(
      "Invalid IP address",
      "Enter a valid IPv4 or IPv6 address.",
    );
  }

  return fetchSecurity({
    cacheKey: `lookup:${ip}`,
    ip,
  });
}

async function fetchSecurity({
  cacheKey,
  ip,
}: {
  cacheKey: string;
  ip?: string | null;
}): Promise<SecurityResult> {
  const cookieStore = await cookies();
  const sessionId =
    cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "anonymous-session";
  const sessionCacheKey = `${sessionId}:${cacheKey}`;
  const cachedResult = getSessionCache<SecurityData>(sessionCacheKey);

  if (cachedResult) {
    return {
      ok: true,
      cached: true,
      data: cachedResult,
    };
  }

  const apiKey = process.env.IPGEOLOCATION_API_KEY;

  if (!apiKey) {
    return createErrorResult(
      "Missing API key",
      "Set IPGEOLOCATION_API_KEY in your .env file before starting the app.",
    );
  }

  let lastError: SecurityResult | null = null;

  for (const endpoint of SECURITY_ENDPOINTS) {
    const params = new URLSearchParams({ apiKey });

    if (ip) {
      params.set("ip", ip);
    }

    try {
      const response = await fetch(`${endpoint}?${params.toString()}`, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorBody = (await safeReadJson(response)) as ApiError | null;
        const message =
          errorBody?.message ||
          errorBody?.detail ||
          `The IP security lookup failed with status ${response.status}.`;
        const upgradeRequired = isUpgradeMessage(response.status, message);
        const result: SecurityResult = {
          ok: false,
          error: {
            title: upgradeRequired
              ? "Paid plan required"
              : getErrorTitle(response.status),
            message,
            status: response.status,
            upgradeRequired,
          },
        };

        lastError = result;

        // Don't fall through on a subscription error — every endpoint returns it.
        if (!upgradeRequired && shouldTryNextEndpoint(response.status, endpoint)) {
          continue;
        }

        return result;
      }

      const payload = (await safeReadJson(response)) as JsonObject | null;

      if (!payload) {
        lastError = createErrorResult(
          "Invalid API response",
          "The API returned an empty or unreadable response.",
        );
        continue;
      }

      const normalized = normalizeSecurityResponse(payload, ip ?? "");

      if (!normalized) {
        lastError = createErrorResult(
          "Unexpected response shape",
          "The API response did not contain the security fields needed to render this tool.",
        );
        continue;
      }

      setSessionCache(sessionCacheKey, normalized);

      return {
        ok: true,
        cached: false,
        data: normalized,
      };
    } catch (error) {
      lastError = createErrorResult(
        "Network error",
        error instanceof Error
          ? error.message
          : "The lookup request could not be completed.",
      );
    }
  }

  return (
    lastError ??
    createErrorResult("Lookup failed", "The IP security lookup could not be completed.")
  );
}

function createErrorResult(
  title: string,
  message: string,
  status?: number,
): SecurityResult {
  return {
    ok: false,
    error: {
      title,
      message,
      status,
    },
  };
}

function normalizeSecurityResponse(
  payload: JsonObject,
  fallbackIp: string,
): SecurityData | null {
  const security = asObject(payload.security);

  if (!security) {
    return null;
  }

  const ip = readString(payload.ip) ?? fallbackIp;

  if (!ip) {
    return null;
  }

  return {
    ip,
    threatScore: readNumber(security.threat_score),
    isVpn: readBoolean(security.is_vpn),
    vpnProviderNames: readStringArray(security.vpn_provider_names),
    vpnConfidenceScore: readNumber(security.vpn_confidence_score),
    vpnLastSeen: readString(security.vpn_last_seen) ?? "",
    isProxy: readBoolean(security.is_proxy),
    proxyProviderNames: readStringArray(security.proxy_provider_names),
    proxyConfidenceScore: readNumber(security.proxy_confidence_score),
    proxyLastSeen: readString(security.proxy_last_seen) ?? "",
    isResidentialProxy: readBoolean(security.is_residential_proxy),
    isTor: readBoolean(security.is_tor),
    isRelay: readBoolean(security.is_relay),
    relayProviderName: readString(security.relay_provider_name) ?? "",
    isAnonymous: readBoolean(security.is_anonymous),
    isKnownAttacker: readBoolean(security.is_known_attacker),
    isBot: readBoolean(security.is_bot),
    isSpam: readBoolean(security.is_spam),
    isCloudProvider: readBoolean(security.is_cloud_provider),
    cloudProviderName: readString(security.cloud_provider_name) ?? "",
  };
}

function isUpgradeMessage(status: number, message: string) {
  return (
    (status === 401 || status === 403) &&
    /subscription|paid|upgrade|not supported/i.test(message)
  );
}

function shouldTryNextEndpoint(status: number, endpoint: string) {
  return endpoint.endsWith("/v3/security") && [400, 404, 405].includes(status);
}

function getErrorTitle(status: number) {
  if (status === 401 || status === 403) {
    return "Authentication failed";
  }

  if (status === 429) {
    return "Rate limit reached";
  }

  if (status >= 500) {
    return "API unavailable";
  }

  return "Lookup failed";
}

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function readBoolean(value: unknown) {
  return value === true;
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim() !== "")
    : [];
}

function asObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

async function safeReadJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getPublicClientIp(headerStore: Headers) {
  const forwarded = [
    headerStore.get("x-forwarded-for"),
    headerStore.get("x-real-ip"),
    headerStore.get("cf-connecting-ip"),
    headerStore.get("x-vercel-forwarded-for"),
    headerStore.get("forwarded"),
  ];

  for (const value of forwarded) {
    const candidate = extractIpCandidate(value);

    if (candidate && isPublicIp(candidate)) {
      return candidate;
    }
  }

  return null;
}

function extractIpCandidate(value: string | null) {
  if (!value) {
    return null;
  }

  const cleaned = value
    .split(",")
    .map((item) => item.trim())
    .find(Boolean);

  if (!cleaned) {
    return null;
  }

  if (cleaned.startsWith("for=")) {
    const match = cleaned.match(/for="?(\[[^\]]+\]|[^;"]+)/i);
    const ip = match?.[1]?.replace(/^\[|\]$/g, "");
    return ip ?? null;
  }

  return cleaned.replace(/^\[|\]$/g, "");
}

function isPublicIp(ip: string) {
  if (ip === "::1" || ip === "127.0.0.1") {
    return false;
  }

  if (ip.includes(":")) {
    const normalized = ip.toLowerCase();

    return !(
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80") ||
      normalized.startsWith("::ffff:127.")
    );
  }

  const octets = ip.split(".").map(Number);

  if (octets.length !== 4 || octets.some((part) => Number.isNaN(part))) {
    return false;
  }

  if (
    octets[0] === 10 ||
    octets[0] === 127 ||
    (octets[0] === 169 && octets[1] === 254) ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168) ||
    (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127)
  ) {
    return false;
  }

  return true;
}
