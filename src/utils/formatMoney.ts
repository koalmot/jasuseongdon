export function formatMoney(value: number) {
  return `${Math.floor(value).toLocaleString("ko-KR")}원`;
}
