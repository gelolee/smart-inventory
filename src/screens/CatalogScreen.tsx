import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import Flaticon from "../components/Flaticon";
import { db } from "../config/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Inventory">;

export default function InventoryScreen({ navigation }: Props) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      // 1. Pull every product — full export, not paginated
      const productsRef = collection(db as any, "products");
      const q = query(productsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        Alert.alert("No Data", "There are no products to export yet.");
        return;
      }

      const rows = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          "Asset Code": data.assetCode || "",
          "Item Name": data.itemName || "",
          Brand: data.brand || "",
          Category: data.category || "",
          Unit: data.unit || "",
          Location: data.location || "",
          "Purchase Date": data.purchaseDate || "",
          "QR Code": data.qrCode || data.qrValue || "",
          "Created At": data.createdAt || "",
        };
      });

      // 2. Build the workbook
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

      // 3. Write as base64 and save to a temp file
      const base64 = XLSX.write(workbook, {
        type: "base64",
        bookType: "xlsx",
      });

      const file = new File(
        Paths.document,
        `inventory_export_${Date.now()}.xlsx`,
      );
      file.write(base64, { encoding: "base64" });
      const fileUri = file.uri;

      // 4. Share it
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Export Inventory",
          UTI: "com.microsoft.excel.xlsx",
        });
      } else {
        Alert.alert("Sharing Unavailable", `File saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      Alert.alert("Export Failed", "Something went wrong generating the file.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
        >
          <Flaticon name="back" size={22} color="#8A8A8F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Dashboard")}
          style={styles.headerBtn}
        >
          <Flaticon name="house" size={22} color="#8A8A8F" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.content}>
        <Flaticon name="boxes" size={64} color="#AEAEB2" />
        <Text style={styles.description}>
          Export your complete inventory database as an Excel file, ready to
          share or archive.
        </Text>

        <TouchableOpacity
          style={[styles.exportButton, isExporting && { opacity: 0.6 }]}
          onPress={handleExport}
          disabled={isExporting}
          activeOpacity={0.8}
        >
          {isExporting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.exportButtonText}>Export to Excel</Text>
          )}
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  description: {
    fontSize: 14,
    fontFamily: "Helvetica-three",
    color: "#8A8A8F",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 32,
    lineHeight: 20,
  },
  exportButton: {
    backgroundColor: "#6C7075",
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  exportButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Helvetica-three",
    letterSpacing: 0.3,
  },
});
