import { RequestHandler } from "express";

export default class IndexController {
  public helloWorld: RequestHandler = async (_, res) => {
    try {
      res.status(200).json({ message: "Hello World!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "SERVER ERROR" });
    }
  };
}
