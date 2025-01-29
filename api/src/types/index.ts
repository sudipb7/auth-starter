import { Router } from "express";

export interface Route {
  path: string;
  router: Router;
}

export type ENV = "development" | "production";
