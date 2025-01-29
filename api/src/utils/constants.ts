import { CorsOptions } from "cors";

require("dotenv/config");

export const { PORT, CLIENT_URL = "http://localhost:3000", NODE_ENV = "development" } = process.env;

export const CORS_OPTIONS: CorsOptions = {
  origin: CLIENT_URL,
  credentials: true,
};
