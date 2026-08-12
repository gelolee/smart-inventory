import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import Flaticon from "../components/Flaticon";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { SvgXml } from "react-native-svg";
import { generateAssetCode } from "../utils/qr";

type Props = NativeStackScreenProps<RootStackParamList, "AddQr">;

export default function QRGeneratorScreen({ navigation }: Props) {
  const [quantity, setQuantity] = useState("");
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [qrImages, setQrImages] = useState<{ code: string; base64: string }[]>(
    [],
  );
  const [showQRGrid, setShowQRGrid] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (isExportingPdf || generatedCodes.length === 0) return;
    setIsExportingPdf(true);

    try {
      // Build the QR grid as HTML — using a public QR image service so
      // expo-print can render actual scannable images inside the PDF.
      const qrCardsHtml = qrImages
        .map(
          (qr) => `
          <div class="qr-card">
            <img src="data:image/png;base64,${qr.base64}" style="width:50px;height:50px;"/>
            <div class="qr-label">${qr.code}</div>
          </div>
        `,
        )
        .join("");

      const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 20px; }
            h1 { font-size: 18px; color: #3A3F47; margin-bottom: 20px; text-align: center; }
            .grid { display: grid; grid-template-columns: repeat(6, 1fr); grid-column-gap: 16px; grid-row-gap: 16px; }
            .qr-card { border: 1px solid #E5E5EA; border-radius: 12px; padding: 16px; text-align: center; box-sizing:border-box;}
            .qr-card img { width: 50px; height: 50px; display:block; margin:0 auto; }
            .qr-label { margin-top: 8px; font-size: 8px; font-weight: 700; color: #3A3F47; }
          </style>
        </head>
        <body>
          <h1>Generated QR Codes (${generatedCodes.length})</h1>
          <div class="grid">${qrCardsHtml}</div>
        </body>
      </html>
    `;

      const pdf = await Print.printToFileAsync({
        html,
        base64: true,
      });
      const uri = pdf.uri;
      const base64 = pdf.base64;
      const fileName = `qr_codes_${Date.now()}.pdf`;
      const appPdfUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(appPdfUri, base64!, {
        encoding: FileSystem.EncodingType.Base64,
      });

      Alert.alert(
        "PDF Ready",
        "Your QR code sheet is ready. What would you like to do?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Share",
            onPress: async () => {
              const canShare = await Sharing.isAvailableAsync();
              if (canShare) {
                await Sharing.shareAsync(appPdfUri, {
                  mimeType: "application/pdf",
                  dialogTitle: "Share QR Codes",
                  UTI: "com.adobe.pdf",
                });
              }
            },
          },
          {
            text: "Download",
            onPress: async () => {
              if (Platform.OS === "android") {
                const permissions =
                  await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (!permissions.granted) return;

                const savedUri =
                  await FileSystem.StorageAccessFramework.createFileAsync(
                    permissions.directoryUri,
                    fileName,
                    "application/pdf",
                  );
                await FileSystem.writeAsStringAsync(
                  savedUri,
                  base64 as string,
                  {
                    encoding: FileSystem.EncodingType.Base64,
                  },
                );

                Alert.alert(
                  "Downloaded",
                  "The PDF has been saved to your chosen folder.",
                );
              } else {
                await Sharing.shareAsync(appPdfUri, {
                  mimeType: "application/pdf",
                  dialogTitle: "Save QR Codes",
                  UTI: "com.adobe.pdf",
                });
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error("PDF export failed:", error);
      Alert.alert("Export Failed", "Something went wrong generating the PDF.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    const count = parseInt(quantity, 10);

    if (isNaN(count) || count <= 0) {
      Alert.alert(
        "Invalid Quantity",
        "Please enter a valid number of QR codes.",
      );
      return;
    }
    if (count > 50) {
      Alert.alert(
        "Limit Exceeded",
        "You can generate a maximum of 50 QR codes to fit on a single A4 sheet.",
      );
      return;
    }

    Keyboard.dismiss();
    setIsGenerating(true);

    try {
      const productsRef = collection(db as any, "products");
      const generatedCodesRef = collection(db as any, "generatedCodes");
      const codes: string[] = [];

      while (codes.length < count) {
        const candidate = generateAssetCode();
        if (codes.includes(candidate)) continue; // avoid dupes within this same batch

        const productCheck = query(
          productsRef,
          where("assetCode", "==", candidate),
        );
        const generatedCheck = query(
          generatedCodesRef,
          where("code", "==", candidate),
        );
        const [productSnap, generatedSnap] = await Promise.all([
          getDocs(productCheck),
          getDocs(generatedCheck),
        ]);
        if (productSnap.empty && generatedSnap.empty) {
          codes.push(candidate);
        }
      }

      await Promise.all(
        codes.map((code) =>
          addDoc(generatedCodesRef, {
            code,
            generatedAt: new Date().toISOString(),
          }),
        ),
      );

      setGeneratedCodes(codes);
      setShowQRGrid(true);
    } catch (error) {
      console.error("QR generation failed:", error);
      Alert.alert(
        "Error",
        "Something went wrong generating the codes. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setShowQRGrid(false);
    setGeneratedCodes([]);
    setQuantity("");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (showQRGrid ? handleReset() : navigation.goBack())}
          style={styles.headerBtn}
        >
          <Flaticon name="back" size={24} color="#8A8A8F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {showQRGrid ? "Print Preview" : "QR Generator"}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Dashboard")}
          style={styles.headerBtn}
        >
          <Flaticon name="house" size={24} color="#8A8A8F" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* VIEW A: Render the QR Code Grid Preview */}
      {showQRGrid ? (
        <View style={styles.gridContainer}>
          <Text style={styles.previewSubtitle}>
            Showing {generatedCodes.length} asset codes ready for printing.
          </Text>

          <FlatList
            data={generatedCodes}
            keyExtractor={(item) => item}
            numColumns={2} // Clean 2-column layout
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.qrCard}>
                {/* Dynamically draws the actual, scannable QR code */}
                <QRCode
                  value={item}
                  size={100}
                  getRef={(ref) => {
                    ref?.toDataURL((data: string) => {
                      setQrImages((prev) => {
                        if (prev.find((x) => x.code === item)) return prev;
                        return [
                          ...prev,
                          {
                            code: item,
                            base64: data,
                          },
                        ];
                      });
                    });
                  }}
                />
                <Text style={styles.qrLabel}>{item}</Text>
              </View>
            )}
          />

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleReset}
            >
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryActionButton,
                isExportingPdf && { opacity: 0.6 },
              ]}
              onPress={handleDownloadPdf}
              disabled={isExportingPdf}
            >
              {isExportingPdf ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryActionButtonText}>Download PDF</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* VIEW B: The Original Input Form */
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardContainer}
          >
            <View style={styles.content}>
              <Text style={styles.mainPrompt}>
                Enter the number of{"\n"}QR codes to generate.
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Number of QR Codes</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter Quantity"
                    placeholderTextColor="#AEAEB2"
                    keyboardType="number-pad"
                    maxLength={2}
                    value={quantity}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9]/g, "");
                      setQuantity(numericValue);
                    }}
                  />
                </View>
              </View>

              <View style={styles.infoRow}>
                <Flaticon
                  name="info"
                  size={16}
                  color="#8A8A8F"
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>
                  Up to 50 QR codes fit on one A4 page.
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Flaticon
                  name="info"
                  size={16}
                  color="#8A8A8F"
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>
                  Additional pages will be created automatically if needed.
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.generateButton,
                  (!quantity || isGenerating) && { backgroundColor: "#AEAEB2" },
                ]}
                onPress={handleGenerate}
                disabled={!quantity || isGenerating}
                activeOpacity={0.8}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.generateButtonText}>Generate</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerBtn: {
    padding: 8,
  },
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
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  mainPrompt: {
    fontSize: 22,
    fontFamily: "Helvetica-one",
    color: "#4A4E54",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 36,
  },
  formGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: "Helvetica-three",
    color: "#6C7075",
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#AEAEB2",
    borderRadius: 25,
    height: 52,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Helvetica-three",
    color: "#1C1C1E",
  },
  dropdownIcon: {
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    paddingHorizontal: 4,
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Helvetica-three",
    color: "#8E8E93",
    lineHeight: 15,
  },
  generateButton: {
    backgroundColor: "#6C7075",
    height: 52,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Helvetica-three",
    letterSpacing: 0.3,
  },
  /* Preview Grid Styling */
  gridContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  previewSubtitle: {
    fontSize: 14,
    fontFamily: "Helvetica-three",
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  qrCard: {
    flex: 0.48, // Creates a beautiful 2-column square card
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  qrLabel: {
    marginTop: 10,
    fontSize: 11,
    fontFamily: "Helvetica-three",
    color: "#3A3F47",
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    backgroundColor: "#FFFFFF",
  },
  secondaryButton: {
    flex: 0.3,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#AEAEB2",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontFamily: "Helvetica-three",
    color: "#4A4E54",
    fontSize: 16,
  },
  primaryActionButton: {
    flex: 0.65,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6C7075",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionButtonText: {
    fontFamily: "Helvetica-one",
    color: "#FFFFFF",
    fontSize: 16,
  },
});
