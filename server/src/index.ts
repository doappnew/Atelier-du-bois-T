import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { z } from "zod";
import { requireAdmin, signSession } from "./auth.js";
import { config } from "./config.js";
import { prisma } from "./db.js";
import { PiApiError, verifyAccessToken } from "./pi.js";

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: config.CLIENT_ORIGIN }));
app.use(express.json({ limit: "100kb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 120 }));

// Vérification de domaine Pi (Developer Portal)
app.get("/validation-key.txt", (_req, res) => {
  res.type("text/plain").send(config.PI_VALIDATION_KEY);
});

app.get("/health", (_req, res) => res.json({ ok: true }));

// Connexion : le navigateur envoie UNIQUEMENT l'accessToken.
app.post("/api/auth/pi", async (req, res, next) => {
  try {
    const { accessToken } = z.object({ accessToken: z.string().min(1) }).parse(req.body);
    const piUser = await verifyAccessToken(accessToken);
    const user = await prisma.user.upsert({
      where: { piUid: piUser.uid },
      update: { username: piUser.username },
      create: { piUid: piUser.uid, username: piUser.username },
    });
    res.json({ token: signSession(user.id), user: { id: user.id, username: user.username } });
  } catch (e) {
    next(e);
  }
});

// Catalogue public : seulement les produits publiés et non archivés.
app.get("/api/products", async (req, res, next) => {
  try {
    const q = z
      .object({ search: z.string().optional(), category: z.string().optional() })
      .parse(req.query);
    const products = await prisma.product.findMany({
      where: {
        published: true,
        archived: false,
        ...(q.search ? { name: { contains: q.search, mode: "insensitive" } } : {}),
        ...(q.category ? { category: { slug: q.category } } : {}),
      },
      include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (e) {
    next(e);
  }
});

app.get("/api/admin/ping", requireAdmin, (_req, res) => res.json({ admin: true }));

// Gestion centralisée des erreurs
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof z.ZodError) return res.status(400).json({ error: "Données invalides" });
  if (err instanceof PiApiError) {
    return res.status(err.status === 401 ? 401 : 502).json({ error: "Vérification Pi impossible" });
  }
  console.error(err);
  res.status(500).json({ error: "Erreur serveur" });
});

app.listen(config.PORT, () => console.log(`Serveur démarré sur le port ${config.PORT}`));
