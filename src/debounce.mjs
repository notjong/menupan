export function debounce(fn, ms) {
  let scheduled = false;
  return () => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(fn, ms);
  };
}
