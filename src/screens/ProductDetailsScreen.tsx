import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import Flaticon from "../components/Flaticon";
import { db } from "../config/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "ProductDetails">;

export interface ProductItem {
  id: string;
  assetCode: string;
  itemName: string;
  unit: string;
  qrCode: string;
  location?: string;
  quantity?: number | string;
  brand?: string;
  category?: string;
  purchaseDate?: string;
  qrValue?: string;
}

function SkeletonCard() {
  const pulseAnim = React.useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
      <View style={styles.cardLeft}>
        <View
          style={[
            styles.skeletonBlock,
            { width: "50%", height: 16, marginBottom: 8 },
          ]}
        />
        <View
          style={[
            styles.skeletonBlock,
            { width: "70%", height: 14, marginBottom: 12 },
          ]}
        />
        <View style={[styles.skeletonBlock, { width: "35%", height: 14 }]} />
      </View>
      <View
        style={[
          styles.skeletonBlock,
          { width: 58, height: 58, borderRadius: 8 },
        ]}
      />
    </Animated.View>
  );
}

export default function ProductsScreen({ navigation }: Props) {
  const { loading: authLoading } = useAuth();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const productsRef = collection(db as any, "products");
    const q = query(productsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: ProductItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ProductItem[];

        setProducts(list);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore products read error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [authLoading]);

  // ─── CARD COMPONENT MATCHING YOUR DESIGN ───
  const renderProductCard = ({ item }: { item: ProductItem }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate("ProductDetailsPreview", {
            product:
              item as RootStackParamList["ProductDetailsPreview"]["product"],
          })
        }
      >
        <View style={styles.cardLeft}>
          <Text style={styles.assetCodeText}>
            {item.assetCode || "NO-CODE"}
          </Text>
          <Text style={styles.itemNameText}>
            {item.itemName || "Unnamed Asset"}
          </Text>
          <Text style={styles.unitText}>
            {item.quantity ? `${item.quantity} ` : ""}
            {item.unit || "pcs"}
          </Text>
        </View>

        <View style={styles.qrContainer}>
          <QRCode
            value={item.qrCode || item.assetCode || "INVALID"}
            size={58}
            color="#3A3F47"
            backgroundColor="transparent"
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
        >
          <Flaticon name="back" size={22} color="#8A8A8F" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Products</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("Dashboard")}
          style={styles.headerBtn}
        >
          <Flaticon name="house" size={22} color="#8A8A8F" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* CONTENT FEED */}
      {loading ? (
        <View style={styles.listContent}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No products found in inventory.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-one",
    color: "#3A3F47",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginHorizontal: 24,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F4F4F6", // Matching the soft light grey capsule card background
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  cardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  assetCodeText: {
    fontSize: 16,
    fontFamily: "Helvetica-one",
    fontWeight: "700",
    color: "#3A3F47",
    marginBottom: 4,
  },
  itemNameText: {
    fontSize: 14,
    fontFamily: "Helvetica-three",
    color: "#8E8E93",
    marginBottom: 12,
  },
  unitText: {
    fontSize: 14,
    fontFamily: "Helvetica-three",
    color: "#8E8E93",
  },
  qrContainer: {
    padding: 4,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    fontSize: 15,
    color: "#8A8A8F",
    fontFamily: "Helvetica-three",
  },
  skeletonBlock: {
    backgroundColor: "#D9D9DE",
    borderRadius: 6,
  },
});
