import express from "express";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
};

const SESSION_COOKIE = "admin_session";
const SESSION_COOKIE_OPTIONS = { httpOnly: true, sameSite: "strict", path: "/" };

export function createApp({ getMenu, hub, auth }) {
  const app = express();
  app.get("/api/menu", (_req, res) => res.json(getMenu()));
  app.get("/events", (_req, res) => {
    res.set(SSE_HEADERS);
    res.flushHeaders();
    hub.add(res);
  });
  app.get("/api/admin/settings", (_req, res) => res.sendStatus(401));
  app.post("/api/admin/login", express.json(), (req, res) => {
    const token = auth.login(req.body?.username, req.body?.password);
    if (!token) return res.sendStatus(401);
    res.cookie(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
    res.sendStatus(200);
  });
  return app;
}
