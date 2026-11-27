import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { prisma } from "./db.js";

export interface Session {
  userId: string;
}

export const signSession = (userId: string) =>
  jwt.sign({ userId }, config.JWT_SECRET, { expiresIn: "7d" });

function readSession(req: Request): Session | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(header.slice(7), config.JWT_SECRET) as Session;
  } catch {
    return null;
  }
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const session = readSession(req);
  if (!session) return res.status(401).json({ error: "Connexion requise" });
  res.locals.userId = session.userId;
  next();
}

// Le rôle admin est relu en base à chaque appel : un utilisateur Pi simple n'est jamais admin.
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = readSession(req);
  if (!session) return res.status(401).json({ error: "Connexion requise" });
  const admin = await prisma.adminUser.findUnique({ where: { userId: session.userId } });
  if (!admin) return res.status(403).json({ error: "Accès refusé" });
  res.locals.userId = session.userId;
  next();
}
