import { initializeApp, getApps } from "firebase/app";
import {
  initializeFirestore,
  memoryLocalCache,
  getFirestore,
  Firestore,
} from "firebase/firestore";
import { initializeAuth, getAuth, Auth } from "firebase/auth";
// @ts-ignore — getReactNativePersistence exists in the React Native bundle at
// runtime, but is missing from the web type definitions Firebase ships for editors.
import { getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDRiy_TN2kZRyA30-ltCaJo8LCnn4k8_v0",
  authDomain: "system-inventory-system.firebaseapp.com",
  projectId: "system-inventory-system",
  storageBucket: "system-inventory-system.firebasestorage.app",
  messagingSenderId: "528546013543",
  appId: "1:528546013543:web:2c5b731c8110f416790fc2",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let db: Firestore;
try {
  db = initializeFirestore(app, {
    // ─── CLEAR ALL WARNINGS USING MEMORY CACHE ───
    localCache: memoryLocalCache(),
  });
} catch (error) {
  db = getFirestore(app);
}

let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

export { db, auth };
