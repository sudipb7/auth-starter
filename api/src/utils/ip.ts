import { Request } from "express";

export function getUserIp(req: Request) {
  return (
    req.clientIp || req.headers["x-forwarded-for"]?.[0] || (req.connection.remoteAddress as string)
  );
}
