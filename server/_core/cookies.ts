import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (forwardedProto) {
    const protoList = Array.isArray(forwardedProto)
      ? forwardedProto
      : forwardedProto.split(",");
    if (protoList.some(proto => proto.trim().toLowerCase() === "https")) {
      return true;
    }
  }

  // Detect Manus proxy hostnames (always HTTPS)
  const hostname = req.hostname || "";
  if (hostname.includes("manus.computer") || hostname.includes("manus.space")) {
    return true;
  }

  return false;
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const hostname = req.hostname;
  const shouldSetDomain =
    hostname &&
    !LOCAL_HOSTS.has(hostname) &&
    !isIpAddress(hostname) &&
    hostname !== "127.0.0.1" &&
    hostname !== "::1";

  let domain: string | undefined = undefined;
  
  if (shouldSetDomain && !hostname.startsWith(".")) {
    // For Manus domains (*.manus.computer, *.manus.space), use the hostname directly
    // For other domains, add leading dot for subdomain sharing
    if (hostname.includes("manus.computer") || hostname.includes("manus.space")) {
      domain = hostname;
    } else {
      domain = `.${hostname}`;
    }
  } else if (shouldSetDomain) {
    domain = hostname;
  }

  const secure = isSecureRequest(req);
  
  console.log("[Cookie] Setting cookie for host:", hostname, "protocol:", req.protocol, "x-forwarded-proto:", req.headers["x-forwarded-proto"], "secure:", secure, "domain:", domain);

  return {
    httpOnly: true,
    path: "/",
    // Always use 'lax' for better browser compatibility
    sameSite: "lax",
    secure: secure,
    domain: domain,
  };
}
