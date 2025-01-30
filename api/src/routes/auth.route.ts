import { Router } from "express";
import { Route } from "../types";
import AuthController from "../controllers/auth.controller";

export default class AuthRouter implements Route {
  public path = "/auth";
  public router: Router;
  private controller = new AuthController();

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route("/sign-up/email").post(this.controller.signUpWithEmail);
    this.router.route("/sign-in/email").post(this.controller.signInWithEmail);
    this.router.route("/sign-in/social/:provider").post(this.controller.signInWithOauth);
    this.router.route("/callback/:provider").get(this.controller.signInWithOauthCallback);
    this.router.route("sign-in/email/verify-email").post(this.controller.verifyEmail);
    this.router.route("/sign-out").post(this.controller.signOut);
  }
}
