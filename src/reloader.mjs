export function createReloader({ readWorkbook, parse, hub, log }) {
  let menu;
  return {
    reload() {
      try {
        menu = parse(readWorkbook());
        hub.broadcast("menu-updated", {});
      } catch (error) {
        log(error);
      }
    },
    getMenu() {
      return menu;
    },
  };
}
