import "express";
import { Session, User } from "../database/schema";

type RequestSession = {
  session: Session | null;
  user: User | null;
};

declare module "express" {
  export interface Request {
    clientIp: string;
    session: RequestSession;
  }
}

export {};
