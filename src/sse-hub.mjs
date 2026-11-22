export function formatSseEvent(name, data) {
  return `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function createSseHub() {
  const clients = new Set();
  return {
    add(res) {
      clients.add(res);
      res.on("close", () => clients.delete(res));
    },
    broadcast(name, data) {
      const frame = formatSseEvent(name, data);
      for (const res of clients) res.write(frame);
    },
  };
}
