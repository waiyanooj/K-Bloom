const money = (value: number) => `${value.toLocaleString("en-US")} MMK`;

export default function PromotionPrice({ price, normalPrice, promotion = 0 }: {
  price: number; normalPrice: number; promotion?: number;
}) {
  return <span className="promotion-prices">
    {promotion > 0 && <del aria-label="Normal price">{money(normalPrice)}</del>}
    <strong aria-label={promotion > 0 ? "Promotion price" : "Price"}>{money(price)}</strong>
  </span>;
}

export function PromotionBadge({ promotion = 0 }: { promotion?: number }) {
  if (promotion <= 0) return null;
  return <span className="promotion-badge">{Number((promotion * 100).toFixed(4))}% off</span>;
}
