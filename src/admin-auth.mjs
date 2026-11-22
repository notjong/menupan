import { createHash, randomUUID, timingSafeEqual } from "node:crypto";

// 길이가 달라도 같은 시간에 비교하려고 해시끼리 비교한다.
function sameSecret(a, b) {
  const digest = (value) => createHash("sha256").update(String(value)).digest();
  return timingSafeEqual(digest(a), digest(b));
}

// 세션은 메모리에만 둔다. 서버를 다시 켜면 다시 로그인한다.
export function createAdminAuth({ username, password }) {
  const sessions = new Set();
  return {
    login(user, pass) {
      const userOk = sameSecret(user, username);
      const passOk = sameSecret(pass, password);
      if (!userOk || !passOk) return null;
      const token = randomUUID();
      sessions.add(token);
      return token;
    },
    isValid(token) {
      return sessions.has(token);
    },
    logout(token) {
      sessions.delete(token);
    },
  };
}
