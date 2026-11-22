import express from "express";

export function createApp({ getMenu }) {
  const app = express();
  app.get("/api/menu", (_req, res) => res.json(getMenu()));
  return app;
}
