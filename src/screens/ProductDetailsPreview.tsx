import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import Flaticon from "../components/Flaticon";
import { useAuth } from "../context/AuthContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "ProductDetailsPreview"
>;

export default function ProductDetailsPreview({ route, navigation }: Props) {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const product = route.params?.product || {};

  const {
    id: productId,
    itemName = "Unnamed Asset",
    assetCode = "N/A",
    brand = "Generic",
    category = "Uncategorized",
    unit = "Piece",
    purchaseDate = "N/A",
    location = "N/A",
    qrCode = "",
    qrValue = "",
  } = product;

  const activeQrPayload = qrCode || qrValue || assetCode;

  const handleShareDetails = async () => {
    try {
      await Share.share({
        message: `Asset Details:\n• Item: ${itemName}\n• Asset Code: ${assetCode}\n• Brand: ${brand}\n• Category: ${category}\n• Unit: ${unit}\n• Purchase Date: ${purchaseDate}\n• Location: ${location}\n• QR Signature: ${activeQrPayload}`,
      });
    } catch (error) {
      Alert.alert("Error", "Could not share asset details.");
    }
  };

  const handleEdit = () => {
    navigation.navigate("RegisterProduct", {
      editProduct: {
        id: productId,
        itemName,
        assetCode,
        brand,
        category,
        unit,
        purchaseDate,
        location,
        qrCode,
        qrValue,
      },
    });
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
        <Text style={styles.headerTitle}>Product Details</Text>

        {isAdmin ? (
          <TouchableOpacity onPress={handleEdit} style={styles.headerBtn}>
            <Feather name="edit-2" size={20} color="#8A8A8F" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleShareDetails}
            style={styles.headerBtn}
          >
            <Feather name="share-2" size={20} color="#8A8A8F" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.divider} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.qrCard}>
          <View style={styles.qrContainer}>
            <QRCode
              value={activeQrPayload || "INVALID_CODE"}
              size={150}
              color="#3A3F47"
              backgroundColor="transparent"
            />
          </View>
          <Text
            style={styles.qrPayloadText}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {activeQrPayload}
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>General Information</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Item Name</Text>
            <Text style={styles.infoValue}>{itemName}</Text>
          </View>
          <View style={styles.rowDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Asset Code</Text>
            <Text style={styles.infoValueHighlight}>{assetCode}</Text>
          </View>
          <View style={styles.rowDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Brand</Text>
            <Text style={styles.infoValue}>{brand}</Text>
          </View>
          <View style={styles.rowDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{category}</Text>
          </View>
          <View style={styles.rowDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Unit of Measurement</Text>
            <Text style={styles.infoValue}>{unit}</Text>
          </View>
          <View style={styles.rowDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Purchase</Text>
            <Text style={styles.infoValue}>{purchaseDate}</Text>
          </View>
          <View style={styles.rowDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>{location}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>Back to Products</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerBtn: { padding: 8 },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-one",
    color: "#3A3F47",
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginHorizontal: 24,
    marginBottom: 20,
  },
  scrollContent: { paddingHorizontal: 28, paddingBottom: 40 },
  qrCard: {
    backgroundColor: "#F4F4F6",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  qrContainer: {
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 12,
  },
  qrPayloadText: {
    fontSize: 14,
    fontFamily: "Helvetica-three",
    color: "#3A3F47",
    marginTop: 2,
    fontWeight: "600",
  },
  sectionHeader: { marginBottom: 10, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 15, fontFamily: "Helvetica-one", color: "#6C7075" },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  rowDivider: { height: 1, backgroundColor: "#F2F2F7" },
  infoLabel: { fontSize: 14, fontFamily: "Helvetica-three", color: "#8A8A8F" },
  infoValue: { fontSize: 15, fontFamily: "Helvetica-three", color: "#1C1C1E" },
  infoValueHighlight: {
    fontSize: 15,
    fontFamily: "Helvetica-three",
    color: "#3A3F47",
    fontWeight: "700",
  },
  doneButton: {
    backgroundColor: "#6C7075",
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Helvetica-three",
    letterSpacing: 0.3,
  },
});
