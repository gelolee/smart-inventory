import type { Timestamp } from "firebase/firestore";

export interface Product {
  id: string;

  itemName: string;
  assetCode: string;
  qrCode: string;

  brand: string;
  category: string;
  unit: string;
  quantity?: number | string;

  purchaseDate: string;
  location: string;

  createdAt: Timestamp;
}
