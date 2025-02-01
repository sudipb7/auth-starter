import { RequestHandler } from "express";
import AuthService from "../services/auth.service";

export const sessionMiddleware: RequestHandler = async (req, res, next) => {
  const authService = new AuthService();
  const session = await authService.getCurrentSession(req as any);

  if (!session.user || !session.session) {
    if (req.method === "GET") {
      authService.deleteSessionCookie(res);
    }
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.method === "GET") {
    authService.setSessionCookie(res, session.session.token);
  }

  (req as any).session = session;
  next();
};
