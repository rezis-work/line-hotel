import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/auth";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ message: "Authorization header missing" });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Invalid token format" });
      return;
    }

    const decoded = verifyAccessToken(token);

    if (decoded.type !== "access") {
      res.status(401).json({ message: "Invalid token type" });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof Error && error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Token expired" });
      return;
    }

    res.status(401).json({ message: "Invalid token" });
    return;
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    next();
  };
};
