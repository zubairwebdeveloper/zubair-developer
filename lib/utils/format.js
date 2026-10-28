export function formatPrice(item) {
  if (item.price == null) return "Request a quote";

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: item.currency ?? "USD",
    maximumFractionDigits: 0,
  }).format(item.price);

  return item.isStartingPrice ? `${formatted}+` : formatted;
}

export function formatStartingPrice(item) {
  return formatPrice({ ...item, isStartingPrice: false });
}
