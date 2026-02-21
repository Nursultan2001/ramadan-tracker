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

export function getSessionCookieOptions(req: Request) {
  const secure = isSecureRequest(req);

  console.log(
    "[Cookie] Host:",
    req.hostname,
    "Protocol:",
    req.protocol,
    "Secure:",
    secure
  );

  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure,
    // DO NOT SET DOMAIN
  };
}
