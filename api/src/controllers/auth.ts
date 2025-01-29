import { RequestHandler } from "express";

export default class AuthController {
  public signUpWithEmail: RequestHandler = async (_, res) => {
    res.status(200).json({ message: "Hello World!" });
  };

  public signInWithEmail: RequestHandler = async (_, res) => {
    res.status(200).json({ message: "Hello World!" });
  };

  public verifyEmail: RequestHandler = async (_, res) => {
    res.status(200).json({ message: "Hello World!" });
  };

  public signInWithOauth: RequestHandler = async (req, res) => {
    const provider = req.params.provider;
    res.status(200).json({ provider });
  };

  public signOut: RequestHandler = async (_, res) => {
    res.status(200).json({ message: "Hello World!" });
  };
}
