import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:password@helium/heliumdb?sslmode=disable";
const DEV_AUTH_MODE = process.env.DEV_AUTH_MODE === "true";
const SESSION_SECRET = process.env.SESSION_SECRET ?? (DEV_AUTH_MODE ? "dev-session-secret" : undefined);
const DEV_USER_ID = process.env.DEV_AUTH_USER_ID ?? "dev-teacher-1";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set unless DEV_AUTH_MODE=true");
  }

  return session({
    secret: SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: !DEV_AUTH_MODE,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

async function setupDevAuth(app: Express) {
  app.use((req, _res, next) => {
    if (!(req.session as any).userId) {
      (req.session as any).userId = DEV_USER_ID;
    }
    next();
  });

  app.get("/api/login", (_req, res) => res.redirect("/home"));
  app.get("/api/callback", (_req, res) => res.redirect("/home"));
  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/"));
  });
  app.post("/api/dev-login", (req, res) => {
    const userId = req.body?.userId || DEV_USER_ID;
    (req.session as any).userId = userId;
    return res.json({
      ok: true,
      user: {
        id: userId,
        role: "teacher",
        onboardingCompleted: true,
        fullNameArabic: "مستخدم تجريبي",
      },
    });
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  if (DEV_AUTH_MODE) {
    await setupDevAuth(app);
    return;
  }

  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  const registeredStrategies = new Set<string>();

  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const sessionUserId = (req.session as any)?.userId;
  if (sessionUserId) {
    return next();
  }

  if (DEV_AUTH_MODE) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

async function getUserIdFromRequest(req: any): Promise<string | null> {
  const sessionUserId = (req.session as any)?.userId;
  if (sessionUserId) {
    return sessionUserId;
  }

  if (DEV_AUTH_MODE) {
    return null;
  }

  const user = req.user as any;
  return user?.claims?.sub || null;
}

export const isCreator: RequestHandler = async (req, res, next) => {
  const userId = await getUserIdFromRequest(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const dbUser = await storage.getUser(userId);
    if (!dbUser || dbUser.role !== "creator") {
      return res.status(403).json({ message: "Forbidden - Creator access required" });
    }
    return next();
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const isPrincipal: RequestHandler = async (req, res, next) => {
  const userId = await getUserIdFromRequest(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const dbUser = await storage.getUser(userId);
    if (!dbUser || (dbUser.role !== "admin" && dbUser.role !== "creator")) {
      return res.status(403).json({ message: "Forbidden - Principal access required" });
    }
    return next();
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const isSupervisor: RequestHandler = async (req, res, next) => {
  const userId = await getUserIdFromRequest(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const dbUser = await storage.getUser(userId);
    if (!dbUser || (dbUser.role !== "admin" && dbUser.role !== "supervisor" && dbUser.role !== "creator")) {
      return res.status(403).json({ message: "Forbidden - Supervisor access required" });
    }
    return next();
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { getUserIdFromRequest };
