export interface WooProduct {
    id: number;
    name: string;
    campus: { value: string; label: string };
    images: string[];
    price: string;
    sale_price: string;
  }