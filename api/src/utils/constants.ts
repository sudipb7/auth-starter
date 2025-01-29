import { CorsOptions } from "cors";
import { ENV } from "../types";

require("dotenv/config");

export const { CLIENT_URL = "http://localhost:3000", DATABASE_URL, JWT_SECRET } = process.env;

export const PORT = +process.env.PORT! || 8000;
export const NODE_ENV = process.env.NODE_ENV as ENV;

export const CORS_OPTIONS: CorsOptions = {
  origin: CLIENT_URL,
  credentials: true,
};
