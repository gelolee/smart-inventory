import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "PrintPreview">;

export default function PrintPreviewScreen({ route, navigation }: Props) {
  const { quantity = 10 } = route.params || {};
  const qrArray = Array.from({ length: Math.min(quantity, 100) });

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Simulates system printing triggers
  const handlePrint = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "🖨️ Hardware Paired",
        "Batch sent to AC Hotel Business Center Wireless Printer successfully!",
        [{ text: "OK", onPress: () => navigation.navigate("Dashboard") }],
      );
    }, 1500);
  };

  // Triggers the simulated mock native PDF sheet window
  const handleExportPDF = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setModalVisible(true); // Pops open our gorgeous mockup share sheet
    }, 1000);
  };

  const closeShareSheet = (actionText: string) => {
    setModalVisible(false);
    Alert.alert("Success", `PDF document ${actionText} successfully!`, [
      {
        text: "Back to Dashboard",
        onPress: () => navigation.navigate("Dashboard"),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
          disabled={loading}
        >
          <Feather name="chevron-left" size={24} color="#8E8E93" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Print Layout</Text>
          <Text style={styles.headerTitleSub}>Preview</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Dashboard")}
          style={styles.headerButton}
          disabled={loading}
        >
          <Feather name="home" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C7075" />
          <Text style={styles.loadingText}>Compiling PDF matrix...</Text>
        </View>
      ) : (
        <>
          <View style={styles.mainContainer}>
            <Text style={styles.summaryText}>
              Generated Batch:{" "}
              <Text style={styles.boldText}>{quantity} Scannable QR Tags</Text>
            </Text>

            <ScrollView
              contentContainerStyle={styles.gridContainer}
              showsVerticalScrollIndicator={false}
            >
              {qrArray.map((_, index) => {
                const qrValue = `AC-MNL-${1000 + index + 1}`;
                return (
                  /* 👇 Change View to TouchableOpacity to simulate scanning when tapped! */
                  <TouchableOpacity
                    key={index}
                    style={styles.qrCard}
                    activeOpacity={0.7}
                    onPress={() => {
                      // Simulates camera barcode reader picking up the code:
                      navigation.navigate("RegisterProduct", {
                        scannedCode: qrValue,
                      });
                    }}
                  >
                    <View style={styles.qrContainer}>
                      <QRCode
                        value={qrValue}
                        size={80}
                        color="#1C1C1E"
                        backgroundColor="transparent"
                      />
                    </View>
                    <Text style={styles.qrLabel}>{qrValue}</Text>
                    <Text style={styles.propertyLabel}>AC MANILA</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Sticky Actions Bar */}
          <View style={styles.footer}>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.pdfButton]}
                onPress={handleExportPDF}
              >
                <Feather
                  name="file-text"
                  size={18}
                  color="#6C7075"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.pdfButtonText}>Export PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.printButton]}
                onPress={handlePrint}
              >
                <Feather
                  name="printer"
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.printButtonText}>Print Batch</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* ================= SIMULATED ENTERPRISE SHARE SHEET MODAL ================= */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.shareSheetContainer}>
            <View style={styles.notchIndicator} />

            <View style={styles.pdfInfoRow}>
              <MaterialCommunityIcons
                name="file-pdf-box"
                size={40}
                color="#D32F2F"
              />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.pdfFilenameTitle}>
                  smart_inventory_batch.pdf
                </Text>
                <Text style={styles.pdfMetadataSubtitle}>
                  PDF Document • 142 KB
                </Text>
              </View>
            </View>

            <Text style={styles.shareActionHeading}>
              Share or Save Document
            </Text>

            {/* Simulated System Share Destinations */}
            <TouchableOpacity
              style={styles.shareOptionRow}
              onPress={() => closeShareSheet("sent via Email")}
            >
              <View
                style={[styles.shareIconBox, { backgroundColor: "#E3F2FD" }]}
              >
                <Feather name="mail" size={20} color="#1976D2" />
              </View>
              <Text style={styles.shareOptionLabel}>
                Send via Hotel Email Address
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareOptionRow}
              onPress={() => closeShareSheet("transmitted via AirDrop")}
            >
              <View
                style={[styles.shareIconBox, { backgroundColor: "#E8F5E9" }]}
              >
                <Feather name="bluetooth" size={20} color="#388E3C" />
              </View>
              <Text style={styles.shareOptionLabel}>
                AirDrop to Management iPad
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareOptionRow}
              onPress={() => closeShareSheet("saved to Local Storage")}
            >
              <View
                style={[styles.shareIconBox, { backgroundColor: "#FFF3E0" }]}
              >
                <Feather name="folder-plus" size={20} color="#F57C00" />
              </View>
              <Text style={styles.shareOptionLabel}>
                Save to Device Files System
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelShareButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelShareButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    minHeight: 70,
  },
  headerButton: { padding: 5 },
  titleContainer: { alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#55555C" },
  headerTitleSub: { fontSize: 20, fontWeight: "600", color: "#55555C" },
  mainContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  summaryText: {
    fontSize: 14,
    color: "#6C7075",
    textAlign: "center",
    marginBottom: 20,
  },
  boldText: { fontWeight: "600", color: "#1C1C1E" },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 110,
  },
  qrCard: {
    width: "47%",
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginBottom: 16,
  },
  qrContainer: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 8,
  },
  qrLabel: { fontSize: 11, fontWeight: "700", color: "#55555C", marginTop: 8 },
  propertyLabel: {
    fontSize: 8,
    color: "#8E8E93",
    fontWeight: "500",
    marginTop: 2,
    letterSpacing: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  actionButton: {
    flexDirection: "row",
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
  },
  printButton: { backgroundColor: "#6C7075" },
  printButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "500" },
  pdfButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#C7C7CC",
  },
  pdfButtonText: { color: "#6C7075", fontSize: 15, fontWeight: "500" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#6C7075", fontSize: 16 },

  // Modal Sheet UI Engine Configuration
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  shareSheetContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 25,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 40 : 25,
  },
  notchIndicator: {
    width: 40,
    height: 5,
    backgroundColor: "#E5E5EA",
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 20,
  },
  pdfInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    paddingBottom: 15,
    marginBottom: 20,
  },
  pdfFilenameTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  pdfMetadataSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 2,
  },
  shareActionHeading: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#8E8E93",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 15,
  },
  shareOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  shareIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  shareOptionLabel: {
    fontSize: 15,
    color: "#1C1C1E",
    fontWeight: "500",
  },
  cancelShareButton: {
    backgroundColor: "#F2F2F7",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  cancelShareButtonText: {
    fontSize: 16,
    color: "#55555C",
    fontWeight: "600",
  },
});
