import axios from "axios";
import { eq } from "drizzle-orm";
import { CookieOptions, Request, Response } from "express";

import {
  APP_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  CLIENT_URL,
} from "../utils/constants";
import {
  accounts,
  AccountSchema,
  accountsSchema,
  OAuthProvider,
  sessions,
  SessionSchema,
  sessionsSchema,
} from "../database/schema";
import db from "../database";
import { getZodError } from "../utils/zod";
import { createToken } from "../utils/encryption";

export default class AuthService {
  private SESSION_TOKEN_COOKIE = "session_token";
  private SESSION_TOKEN_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days

  private AUTH_STATE_COOKIE = "auth_state";
  private AUTH_STATE_MAX_AGE = 1000 * 60 * 5; // 5 minutes

  private GITHUB_PROFILE_URL = "https://api.github.com/user";
  private GITHUB_EMAILS_URL = "https://api.github.com/user/emails";
  private GITHUB_ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";

  private GOOGLE_ACCESS_TOKEN_URL = "https://oauth2.googleapis.com/token";
  private GOOGLE_PROFILE_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

  private OAUTH_SCOPES = {
    GITHUB: ["user:email", "read:user"],
    GOOGLE: ["email", "profile"],
  };

  private COOKIE_OPTIONS: CookieOptions = {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    domain:
      process.env.NODE_ENV === "production"
        ? "." + CLIENT_URL?.split(".").slice(1).join(".")
        : undefined, // .domain.com for accessing across subdomains
  };

  public setOAuthState(res: Response) {
    const state = crypto.randomUUID();
    res.cookie(this.AUTH_STATE_COOKIE, state, {
      ...this.COOKIE_OPTIONS,
      maxAge: this.AUTH_STATE_MAX_AGE,
    });
    return state;
  }

  public verifyOAuthState(state: string, req: Request, res: Response) {
    const storedState = req.cookies[this.AUTH_STATE_COOKIE];
    return state === storedState;
  }

  public destroyOAuthState(res: Response) {
    res.clearCookie(this.AUTH_STATE_COOKIE, this.COOKIE_OPTIONS);
  }

  public createSessionToken(userId: string) {
    return createToken({ userId });
  }

  public async createSession(data: SessionSchema) {
    const validated = sessionsSchema.safeParse(data);
    if (!validated.success) {
      throw new Error(getZodError(validated.error));
    }

    if (validated.data.mode !== "create") {
      throw new Error("Invalid Data");
    }

    const session = await db
      .insert(sessions)
      .values({ ...validated.data, expiresAt: new Date(Date.now() + this.SESSION_TOKEN_MAX_AGE) })
      .returning();

    if (!session[0]) {
      throw new Error("Failed to create session");
    }

    return session[0];
  }

  public setSessionCookie(res: Response, token: string) {
    res.cookie(this.SESSION_TOKEN_COOKIE, token, {
      ...this.COOKIE_OPTIONS,
      maxAge: this.SESSION_TOKEN_MAX_AGE,
    });
  }

  public generateOauthAuthorizationUrl(provider: OAuthProvider, state: string) {
    switch (provider) {
      case "github": {
        const url = new URL("https://github.com");
        url.pathname = "/login/oauth/authorize";
        url.searchParams.append("client_id", GITHUB_CLIENT_ID!);
        url.searchParams.append("scope", this.OAUTH_SCOPES["GITHUB"].join(" "));
        url.searchParams.append("redirect_uri", `${APP_URL}/v1/auth/callback/github`);
        url.searchParams.append("state", state);
        return url.toString();
      }
      case "google": {
        const url = new URL("https://accounts.google.com");
        url.pathname = "/o/oauth2/v2/auth";
        url.searchParams.append("client_id", GOOGLE_CLIENT_ID!);
        url.searchParams.append("scope", this.OAUTH_SCOPES["GOOGLE"].join(" "));
        url.searchParams.append("response_type", "code");
        url.searchParams.append("access_type", "offline"); // to get refresh token
        url.searchParams.append("prompt", "consent");
        url.searchParams.append("redirect_uri", `${APP_URL}/v1/auth/callback/google`);
        url.searchParams.append("state", state);
        return url.toString();
      }
      default:
        throw new Error("Invalid OAuth provider");
    }
  }

  public async getAccessToken(
    provider: OAuthProvider,
    code: string
  ): Promise<{
    type: string;
    scope: string;
    access_token: string;
    refresh_token?: string;
    expires_in?: Date;
  }> {
    switch (provider) {
      case "github": {
        const { data } = await axios.post(
          this.GITHUB_ACCESS_TOKEN_URL,
          {
            code,
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        return {
          access_token: data.access_token,
          scope: data.scope.split(" ").join(","),
          type: data.token_type.toLowerCase(),
        };
      }
      case "google": {
        const { data } = await axios.post(this.GOOGLE_ACCESS_TOKEN_URL, {
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          grant_type: "authorization_code",
          redirect_uri: `${APP_URL}/v1/auth/callback/google`,
        });

        return {
          access_token: data.access_token,
          scope: data.scope.split(" ").join(","),
          type: data.token_type.toLowerCase(),
          expires_in: new Date(Date.now() + data.expires_in * 1000), // access token expires in 1 hour
          refresh_token: data.refresh_token,
        };
      }
      default:
        throw new Error("Invalid OAuth provider");
    }
  }

  public async getOauthProfile(
    provider: OAuthProvider,
    access_token: string
  ): Promise<{
    name: string;
    email: string;
    image: string;
    providerId: string;
    username?: string;
  }> {
    switch (provider) {
      case "github": {
        const [profile, emails] = await Promise.all([
          axios
            .get(this.GITHUB_PROFILE_URL, {
              headers: {
                Authorization: `Bearer ${access_token}`,
                Accept: "application/json",
              },
            })
            .then(({ data }) => data),
          axios
            .get(this.GITHUB_EMAILS_URL, {
              headers: {
                Authorization: `Bearer ${access_token}`,
                Accept: "application/json",
              },
            })
            .then(({ data }) => data),
        ]);

        const primaryEmail = emails.find((email: Record<string, any>) => email.primary)?.email;

        return {
          providerId: profile.id.toString(),
          username: profile.login,
          name: profile.name,
          email: primaryEmail,
          image: profile.avatar_url,
        };
      }
      case "google": {
        const { data } = await axios.get(this.GOOGLE_PROFILE_URL, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            Accept: "application/json",
          },
        });

        return {
          name: data.name,
          email: data.email,
          image: data.picture,
          providerId: data.id,
        };
      }
      default:
        throw new Error("Invalid OAuth provider");
    }
  }

  public async getUserAccounts(userId: string) {
    const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId));
    return userAccounts;
  }

  public async createUserAccount(data: AccountSchema) {
    const validated = accountsSchema.safeParse(data);
    if (!validated.success) {
      throw new Error(getZodError(validated.error));
    }

    if (validated.data.mode === "update" || validated.data.mode === "changePassword") {
      throw new Error("Invalid Data");
    }

    const account = await db
      .insert(accounts)
      .values({ ...validated.data })
      .returning();

    if (!account[0]) {
      throw new Error("Failed to create account");
    }

    return account[0];
  }

  public async updateUserAccount(data: AccountSchema) {
    const validated = accountsSchema.safeParse(data);
    if (!validated.success) {
      throw new Error(getZodError(validated.error));
    }

    if (validated.data.mode !== "update") {
      throw new Error("Invalid Data");
    }

    const account = await db
      .update(accounts)
      .set({
        ...validated.data,
      })
      .returning();

    if (!account[0]) {
      throw new Error("Failed to update account");
    }

    return account[0];
  }
}
