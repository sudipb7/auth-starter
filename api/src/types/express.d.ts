import "express";

declare module "express" {
  export interface Request {
    clientIp: string;
  }
}
