const KRW_NUMBER_FORMAT = new Intl.NumberFormat("ko-KR");
const PRICE_UNIT = "원";

export function formatPrice(price) {
  return `${KRW_NUMBER_FORMAT.format(price)}${PRICE_UNIT}`;
}
