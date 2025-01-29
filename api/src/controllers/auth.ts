import { RequestHandler } from "express";

export default class AuthController {
  public signUpWithEmail: RequestHandler = async (_, res) => {
    try {
      res.status(200).json({ message: "Hello World!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "SERVER ERROR" });
    }
  };

  public signInWithEmail: RequestHandler = async (_, res) => {
    try {
      res.status(200).json({ message: "Hello World!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "SERVER ERROR" });
    }
  };

  public verifyEmail: RequestHandler = async (_, res) => {
    try {
      res.status(200).json({ message: "Hello World!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "SERVER ERROR" });
    }
  };

  public signInWithOauth: RequestHandler = async (req, res) => {
    try {
      const provider = req.params.provider;
      res.status(200).json({ provider });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "SERVER ERROR" });
    }
  };

  public signOut: RequestHandler = async (_, res) => {
    try {
      res.status(200).json({ message: "Hello World!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "SERVER ERROR" });
    }
  };
}
