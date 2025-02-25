import { RequestHandler } from "express";

import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import { CLIENT_URL } from "../utils/constants";
import { OAuthProvider, OAuthProviders } from "../database/schema";
import { getUserIp } from "../utils/ip";

export default class AuthController {
  private authService = new AuthService();
  private userService = new UserService();

  public signUpWithEmail: RequestHandler = async (_, res) => {
    res.status(200).json({ message: "Hello World!" });
  };

  public signInWithEmail: RequestHandler = async (_, res) => {
    res.status(200).json({ message: "Hello World!" });
  };

  public verifyEmail: RequestHandler = async (_, res) => {
    res.status(200).json({ message: "Hello World!" });
  };

  public signInWithOauth: RequestHandler = async (req, res) => {
    const provider = req.params.provider as any;
    if (!provider || !OAuthProviders.includes(provider)) {
      res.status(400).json({ error: "Invalid OAuth provider" });
      return;
    }

    const session = await this.authService.getCurrentSession(req as any);
    if (session.user && session.session) {
      res.status(307).redirect(CLIENT_URL!);
      return;
    }

    const state = this.authService.setOAuthState(res);
    const url = this.authService.generateOauthAuthorizationUrl(provider, state);

    res.status(307).redirect(url);
  };

  public signInWithOauthCallback: RequestHandler = async (req, res) => {
    const code = req.query.code as string;
    const state = req.query.state as string;
    const provider = req.params.provider as OAuthProvider;
    const ipAddress = getUserIp(req as any);
    const userAgent = req.headers["user-agent"];

    if ([state, code, provider].some(val => !val)) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    if (provider !== "google" && provider !== "github") {
      res.status(400).json({ error: "Invalid OAuth provider" });
      return;
    }

    const isStateValid = this.authService.verifyOAuthState(state, req as any, res);
    if (!isStateValid) {
      this.authService.destroyOAuthState(res);
      res.status(400).json({ error: "Invalid state" });
      return;
    }

    this.authService.destroyOAuthState(res);

    const token = await this.authService.getAccessToken(provider, code);
    const profile = await this.authService.getOauthProfile(provider, token.access_token);

    let user = await this.userService.findUserByEmail(profile.email);
    if (user) {
      user = await this.userService.updateUserById({
        mode: "update",
        id: user.id,
        name: user.name || profile.name,
        emailVerified: new Date(),
        ...(!user.image && { image: profile.image }),
      });
    } else {
      user = await this.userService.createUser({
        mode: "oauthSignIn",
        email: profile.email,
        name: profile.name,
        image: profile.image,
        emailVerified: new Date(),
      });
    }

    const accounts = await this.authService.getUserAccounts(user?.id!);
    let account = accounts.find(
      acc => acc.provider === provider && acc.providerId === profile.providerId
    );
    if (account) {
      account = await this.authService.updateUserAccount({
        mode: "update",
        id: account.id,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        updatedAt: new Date(),
      });
    } else {
      account = await this.authService.createUserAccount({
        mode: "oauthSignIn",
        userId: user?.id!,
        provider,
        providerId: profile.providerId,
        type: token.type,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        scope: token.scope,
        username: profile.username,
      });
    }

    const sessionToken = this.authService.createSessionToken(user?.id!);

    await this.authService.createSession({
      mode: "create",
      userId: user?.id!,
      token: sessionToken,
      ipAddress,
      userAgent,
    });

    this.authService.setSessionCookie(res, sessionToken);

    res.status(307).redirect(CLIENT_URL!);
  };

  public getSession: RequestHandler = async (req, res) => {
    const session = await this.authService.getCurrentSession(req as any);

    if (!session.user || !session.session) {
      this.authService.deleteSessionCookie(res);
      res.status(200).json({ session: null, user: null });
      return;
    }

    this.authService.setSessionCookie(res, session.session.token);

    res.status(200).json(session);
  };

  public signOut: RequestHandler = async (req, res) => {
    const session = (req as any).session;

    await this.authService.deleteSession({ mode: "delete", id: session.session.id });
    this.authService.deleteSessionCookie(res);

    res.status(200).json({ message: "Signed out" });
  };
}
