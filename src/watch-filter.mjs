import { basename } from "node:path";

export function shouldReload(path) {
  return !basename(path).startsWith("~$");
}
