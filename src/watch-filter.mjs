import { basename } from "node:path";

const EXCEL_LOCK_FILE_PREFIX = "~$";

export function shouldReload(path) {
  return !basename(path).startsWith(EXCEL_LOCK_FILE_PREFIX);
}
