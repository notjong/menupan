import { randomUUID } from "node:crypto";

export function createAdminAuth({ username, password }) {
  const sessions = new Set();
  return {
    login(user, pass) {
      if (user !== username || pass !== password) return null;
      const token = randomUUID();
      sessions.add(token);
      return token;
    },
    isValid(token) {
      return sessions.has(token);
    },
  };
}
