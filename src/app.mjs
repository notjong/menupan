import express from "express";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
};

export function createApp({ getMenu, hub }) {
  const app = express();
  app.get("/api/menu", (_req, res) => res.json(getMenu()));
  app.get("/events", (_req, res) => {
    res.set(SSE_HEADERS);
    res.flushHeaders();
    hub.add(res);
  });
  app.get("/api/admin/settings", (_req, res) => res.sendStatus(401));
  return app;
}
