import { Router } from "express";
import { Route } from "../types";
import IndexController from "../controllers";

export default class IndexRouter implements Route {
  public path = "/";
  public router: Router;
  private controller = new IndexController();

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route("/").get(this.controller.helloWorld);
  }
}
