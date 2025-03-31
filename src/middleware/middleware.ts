import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/db";
import { tryCatch } from "../constants/tryCatch";

declare module "express" {
  interface Request {
    user?: any;
  }
}
export const middleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("Middleware called");
  const token = req.cookies?.token || req.headers?.token;

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }

  const decoded = jwt.verify(token, secret) as { id: string };
  if (!decoded) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { data: user, error } = await tryCatch(
    db.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })
  );
  if (error) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  req.user = user;
  next();
};
