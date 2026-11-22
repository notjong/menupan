import express from "express";

export function createApp({ getMenu, hub }) {
  const app = express();
  app.get("/api/menu", (_req, res) => res.json(getMenu()));
  app.get("/events", (_req, res) => {
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.flushHeaders();
    hub.add(res);
  });
  return app;
}
