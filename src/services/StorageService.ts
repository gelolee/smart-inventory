import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

export interface Product {
  id: string;
  code: string;
  name: string;
  quantity: string;
  dateAdded: string;
}

const PRODUCTS_COLLECTION = "products";

export const StorageService = {
  // 1. Fetch all products in real-time from the cloud
  getProducts: async (): Promise<Product[]> => {
    try {
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const q = query(productsRef, orderBy("dateAdded", "desc"));
      const querySnapshot = await getDocs(q);

      const products: Product[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        products.push({
          id: docSnapshot.id,
          code: data.code,
          name: data.name,
          quantity: data.quantity,
          dateAdded: data.dateAdded,
        });
      });
      return products;
    } catch (error) {
      console.error("Firebase read error:", error);
      return [];
    }
  },

  // 2. Save a scanned product directly to the shared cloud
  saveProduct: async (
    newProduct: Omit<Product, "id" | "dateAdded">,
  ): Promise<boolean> => {
    try {
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      await addDoc(productsRef, {
        ...newProduct,
        dateAdded: new Date().toLocaleDateString(),
      });
      return true;
    } catch (error) {
      console.error("Firebase write error:", error);
      return false;
    }
  },

  // 3. Clear everything (good for database cleanup)
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
