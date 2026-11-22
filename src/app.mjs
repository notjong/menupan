import express from "express";
import { DEVICES } from "./devices.mjs";

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

export function createApp({ getMenu, hub, auth, getThemes }) {
  const app = express();
  app.get("/api/menu", (_req, res) => res.json(getMenu()));
  app.get("/events", (_req, res) => {
    res.set(SSE_HEADERS);
    res.flushHeaders();
    hub.add(res);
  });
  app.get("/api/admin/settings", (req, res) => {
    if (!auth.isValid(readCookie(req, SESSION_COOKIE))) return res.sendStatus(401);
    const { storeName, tagline, theme, device, autoAdvanceSec } = getMenu();
    res.json({
      settings: { storeName, tagline, theme, device, autoAdvanceSec },
      themes: getThemes(),
      devices: DEVICES,
    });
  });
  app.post("/api/admin/login", express.json(), (req, res) => {
    const token = auth.login(req.body?.username, req.body?.password);
    if (!token) return res.sendStatus(401);
    res.cookie(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
    res.sendStatus(200);
  });
  return app;
}
