export const fmtMoney = (n: number) =>
  Intl.NumberFormat("vi-VN").format(n ?? 0) + " đ";
