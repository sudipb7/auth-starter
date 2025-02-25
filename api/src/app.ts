/// <reference path="./types/express.d.ts" />

import cors from "cors";
import morgan from "morgan";
import requestIp from "request-ip";
import cookieParser from "cookie-parser";
import express, { Application } from "express";

import { ENV, Route } from "./types";
import { rateLimiter } from "./utils/rateLimiter";
import { errorMiddleware } from "./middlewares/error.middleware";
import { CORS_OPTIONS, NODE_ENV, PORT } from "./utils/constants";

require("dotenv/config");

export default class App {
  private app: Application;
  private PORT: number;
  private ENV: ENV;

  constructor(routes: Route[]) {
    this.PORT = PORT;
    this.ENV = NODE_ENV;
    this.app = express();
    this.attachMiddlewares();
    this.attachRoutes(routes);
  }

  attachMiddlewares() {
    this.app.set("trust proxy", true);
    this.app.use(requestIp.mw());
    this.app.use(rateLimiter);
    this.app.use(express.static("public"));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(cors(CORS_OPTIONS));
    this.app.use(morgan("dev"));
    this.app.use(errorMiddleware);
  }

  attachRoutes(routes: Route[]) {
    routes.forEach(route => this.app.use(`/v1${route.path}`, route.router));
  }

  listen() {
    this.app.listen(this.PORT, () =>
      console.log(`ENV: ${this.ENV}\nURL: http://localhost:${this.PORT}`)
    );
  }
}
