import { RequestHandler } from "express";

export default class IndexController {
  public helloWorld: RequestHandler = async (_, res) => {
    res.status(200).json({ message: "Hello World!" });
  };
}
