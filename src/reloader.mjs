import { MENU_UPDATED_EVENT } from "./sse-hub.mjs";

export function createReloader({ readWorkbook, parse, hub, log }) {
  let menu;
  return {
    reload() {
      try {
        menu = parse(readWorkbook());
        hub.broadcast(MENU_UPDATED_EVENT, {});
      } catch (error) {
        log(error);
      }
    },
    getMenu() {
      return menu;
    },
  };
}
