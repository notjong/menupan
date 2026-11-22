import express from "express";
import { DEVICES } from "./devices.mjs";
import { validateSettings } from "./validate-settings.mjs";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
};

const SESSION_COOKIE = "admin_session";
const SESSION_COOKIE_OPTIONS = { httpOnly: true, sameSite: "strict", path: "/" };

function readCookie(req, name) {
  for (const part of (req.headers.cookie ?? "").split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return undefined;
}

function pickSettings({ storeName, tagline, theme, device, autoAdvanceSec }) {
  return { storeName, tagline, theme, device, autoAdvanceSec };
}

// /api/admin/*: 로그인한 어드민만 _설정 값을 읽고 바꾼다.
function createAdminRouter({ getMenu, auth, getThemes, saveSettings }) {
  const router = express.Router();
  const requireSession = (req, res, next) =>
    auth.isValid(readCookie(req, SESSION_COOKIE)) ? next() : res.sendStatus(401);

  router.post("/login", express.json(), (req, res) => {
    const token = auth.login(req.body?.username, req.body?.password);
    if (!token) return res.sendStatus(401);
    res.cookie(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
    res.sendStatus(200);
  });
  router.post("/logout", (req, res) => {
    auth.logout(readCookie(req, SESSION_COOKIE));
    res.clearCookie(SESSION_COOKIE, SESSION_COOKIE_OPTIONS);
    res.sendStatus(204);
  });
  router.get("/settings", requireSession, (_req, res) => {
    res.json({ settings: pickSettings(getMenu()), themes: getThemes(), devices: DEVICES });
  });
  router.put("/settings", requireSession, express.json(), (req, res) => {
    const result = validateSettings(req.body ?? {}, { themes: getThemes(), devices: DEVICES });
    if (!result.ok) return res.status(400).json({ errors: result.errors });
    saveSettings(result.settings);
    res.sendStatus(204);
  });
  return router;
}

export function createApp({ getMenu, hub, auth, getThemes, saveSettings }) {
  const app = express();
  app.get("/api/menu", (_req, res) => res.json(getMenu()));
  app.get("/events", (_req, res) => {
    res.set(SSE_HEADERS);
    res.flushHeaders();
    hub.add(res);
  });
  app.use("/api/admin", createAdminRouter({ getMenu, auth, getThemes, saveSettings }));
  return app;
}
