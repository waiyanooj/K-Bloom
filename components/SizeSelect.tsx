import type { Product } from "../lib/products";
import { isProductSize, productSizes, sizeLabel, type ProductSize } from "../lib/product-sizes";

export default function SizeSelect({ product, value, onChange }: {
  product: Product;
  value: ProductSize;
  onChange: (size: ProductSize) => void;
}) {
  return (
    <label className="product-size-select">
      <span>Size</span>
      <select aria-label={`Size for ${product.name.trim()}`} value={value}
        onChange={(event) => {
          if (isProductSize(event.target.value)) onChange(event.target.value);
        }}>
        {productSizes.map((size) => (
          <option key={size} value={size}>{sizeLabel(product, size)}</option>
        ))}
      </select>
    </label>
  );
}
