export function createReloader({ readWorkbook, parse, log }) {
  let menu;
  return {
    reload() {
      try {
        menu = parse(readWorkbook());
      } catch (error) {
        log(error);
      }
    },
    getMenu() {
      return menu;
    },
  };
}
