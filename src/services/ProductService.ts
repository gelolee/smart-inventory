import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import type { Product } from "../types/Product";

export interface CreateProductDto {
  itemName: string;
  assetCode: string;
  qrCode: string;
  brand: string;
  category: string;
  unit: string;
  purchaseDate: string;
  location: string;
}

export interface UpdateProductDto {
  id: string;
  itemName: string;
  assetCode: string;
  brand: string;
  category: string;
  unit: string;
  purchaseDate: string;
  location: string;
}

const PRODUCTS_COLLECTION = "products";

function mapDocToProduct(docSnapshot: any): Product {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    ...data,
    qrCode: data.qrCode || data.qrValue || data.assetCode || "",
  } as Product;
}

export const ProductService = {
  subscribeToProducts: (
    onUpdate: (products: Product[]) => void,
    onError: (error: Error) => void,
  ): (() => void) => {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, orderBy("createdAt", "desc"));

    return onSnapshot(
      q,
      (snapshot) => onUpdate(snapshot.docs.map(mapDocToProduct)),
      onError,
    );
  },

  updateProduct: async (product: UpdateProductDto): Promise<void> => {
    try {
      const productRef = doc(db, PRODUCTS_COLLECTION, product.id);
      await updateDoc(productRef, {
        itemName: product.itemName,
        assetCode: product.assetCode,
        brand: product.brand,
        category: product.category,
        unit: product.unit,
        purchaseDate: product.purchaseDate,
        location: product.location,
      });
    } catch (error) {
      console.error("Firebase update error:", error);
      throw error;
    }
  },

  isQRCodeTaken: async (qrCode: string): Promise<boolean> => {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, where("qrCode", "==", qrCode));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  },

  findProductByQRCode: async (qrCode: string): Promise<Product | null> => {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, where("qrCode", "==", qrCode));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    return mapDocToProduct(snapshot.docs[0]);
  },

  isAssetCodeTaken: async (
    assetCode: string,
    currentProductId?: string,
  ): Promise<boolean> => {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, where("assetCode", "==", assetCode));
    const snapshot = await getDocs(q);
    if (!currentProductId) {
      return !snapshot.empty;
    }
    return snapshot.docs.some((doc) => doc.id !== currentProductId);
  },

  getProducts: async (): Promise<Product[]> => {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(mapDocToProduct);
  },

  saveProduct: async (product: CreateProductDto) => {
    try {
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      return await addDoc(productsRef, {
        ...product,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Firebase save error:", error);
      throw error;
    }
  },

  // ⚠️ DESTRUCTIVE: Deletes ALL products permanently. Admin-only via Firestore
  // Security Rules, but callers must still gate this behind an explicit
  // confirmation dialog — there is no undo.
  clearAll: async (): Promise<void> => {
    try {
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const querySnapshot = await getDocs(productsRef);
      const deletePromises = querySnapshot.docs.map((docSnapshot) =>
        deleteDoc(doc(db, PRODUCTS_COLLECTION, docSnapshot.id)),
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Firebase batch delete error:", error);
    }
  },
};
