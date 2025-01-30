import { CorsOptions } from "cors";
import { ENV } from "../types";

require("dotenv/config");

export const {
  DATABASE_URL,
  JWT_SECRET,
  HOSTNAME,
  APP_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} = process.env;

export const PORT = +process.env.PORT! || 8000;
export const NODE_ENV = process.env.NODE_ENV as ENV;

export const CORS_OPTIONS: CorsOptions = {
  origin: NODE_ENV === "production" ? `https://${HOSTNAME}` : "*",
  credentials: true,
};
