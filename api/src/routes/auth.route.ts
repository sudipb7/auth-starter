import { Router } from "express";
import { Route } from "../types";
import AuthController from "../controllers/auth.controller";
import { sessionMiddleware } from "../middlewares/session.middleware";

export default class AuthRouter implements Route {
  public path = "/auth";
  public router: Router;
  private controller = new AuthController();

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/session", this.controller.getSession);
    this.router.post("/sign-up/email", this.controller.signUpWithEmail);
    this.router.post("/sign-in/email", this.controller.signInWithEmail);
    this.router.get("/sign-in/social/:provider", this.controller.signInWithOauth);
    this.router.get("/callback/:provider", this.controller.signInWithOauthCallback);
    this.router.post("sign-in/email/verify-email", this.controller.verifyEmail);
    this.router.post("/sign-out", sessionMiddleware, this.controller.signOut);
  }
}
