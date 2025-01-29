import { ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = (error, req, res, __) => {
  console.error(error);
  if (req.statusCode === 429) {
    res.status(429).json({ error: "Rate limit exceeded" });
    return;
  } else if (req.statusCode === 401) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  } else {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
