export function formatSseEvent(name, data) {
  return `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function createSseHub() {
  const clients = new Set();
  return {
    add(res) {
      clients.add(res);
    },
    broadcast(name, data) {
      for (const res of clients) res.write(formatSseEvent(name, data));
    },
  };
}
