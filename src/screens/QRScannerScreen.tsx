import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { db } from "../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "QRScannerScreen">;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const TARGET_SIZE = 240;

export default function ScannerScreen({ navigation }: Props) {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [animationValue] = useState(new Animated.Value(0));
  const [guideText, setGuideText] = useState(
    "Fit the QR code inside the frame",
  );
  const [isAligned, setIsAligned] = useState(false);
  const [isCheckingDB, setIsCheckingDB] = useState(false);

  const seenDataFrames = useRef<{ [key: string]: number }>({});
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const loopAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animationValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animationValue, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    );
    loopAnimation.start();
    return () => loopAnimation.stop();
  }, []);

  const laserTranslateY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TARGET_SIZE - 20],
  });

  if (!permission) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.infoText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.errorText}>
          We need your permission to open the camera scanner.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>
            Grant Camera Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Helper utility to cleanly reset scanner states
  const resetScannerState = () => {
    setScanned(false);
    setIsAligned(false);
    setGuideText("Fit the QR code inside the frame");
    setIsCheckingDB(false);
    seenDataFrames.current = {};
  };

  const handleBarcodeScanned = async (event: any) => {
    if (scanned) return;

    const { bounds, data } = event;
    if (!bounds) return;

    const { origin, size } = bounds;
    if (!origin || !size) return;

    const rawQrPayload = data.trim();

    const now = Date.now();

    // 1. MULTI-QR DETECTION LOGIC
    seenDataFrames.current[data] = now;

    Object.keys(seenDataFrames.current).forEach((key) => {
      if (now - seenDataFrames.current[key] > 400) {
        delete seenDataFrames.current[key];
      }
    });

    const uniqueQRCodesCount = Object.keys(seenDataFrames.current).length;
    if (uniqueQRCodesCount > 1) {
      setGuideText("Multiple QRs detected! Isolate only 1");
      setIsAligned(false);
      return;
    }

    // 2. DISTANCE CHECK
    const qrWidth = size.width;
    const qrHeight = size.height;
    const minQrSize = 110;

    if (qrWidth < minQrSize || qrHeight < minQrSize) {
      setGuideText("Move closer to fill the box");
      setIsAligned(false);
      return;
    }

    // 3. BOUNDS & ALIGNMENT CHECK
    const targetLeft = (SCREEN_WIDTH - TARGET_SIZE) / 2;
    const targetTop = (SCREEN_HEIGHT - TARGET_SIZE) / 2;
    const targetRight = targetLeft + TARGET_SIZE;
    const targetBottom = targetTop + TARGET_SIZE;

    const qrLeft = origin.x;
    const qrTop = origin.y;
    const qrRight = qrLeft + qrWidth;
    const qrBottom = qrTop + qrHeight;

    const insideBox =
      qrLeft >= targetLeft - 30 &&
      qrRight <= targetRight + 30 &&
      qrTop >= targetTop - 30 &&
      qrBottom <= targetBottom + 30;

    if (!insideBox) {
      setGuideText("Center the QR code in the box");
      setIsAligned(false);
      return;
    }

    // Success: Lock scanner state and hit the DB
    setIsAligned(true);
    setGuideText("Target Lock! Checking Database...");
    setScanned(true);
    setIsCheckingDB(true);

    // Only accept QR codes matching our generated asset code format (e.g. AST-1234)
    const ASSET_CODE_PATTERN = /^AST-\d{4}$/;
    if (!ASSET_CODE_PATTERN.test(rawQrPayload)) {
      setIsCheckingDB(false);
      Alert.alert(
        "Invalid QR Code",
        "This QR code was not generated by this app and cannot be used here.",
        [{ text: "Scan Another", onPress: resetScannerState }],
      );
      return;
    }

    try {
      const productsRef = collection(db as any, "products");
      const q = query(productsRef, where("qrCode", "==", rawQrPayload));
      const querySnapshot = await getDocs(q);

      setTimeout(() => {
        if (!isMountedRef.current) return;
        setIsCheckingDB(false);

        if (!querySnapshot.empty) {
          const matchedDoc = querySnapshot.docs[0];
          const product = {
            id: matchedDoc.id,
            ...matchedDoc.data(),
          } as RootStackParamList["ProductDetailsPreview"]["product"];
          navigation.navigate("ProductDetailsPreview", { product });
          resetScannerState();
        } else {
          if (!isAdmin) {
            Alert.alert(
              "Access Restricted",
              "This QR code isn't registered yet. Only admins can add new products.",
              [{ text: "OK", onPress: resetScannerState }],
            );
            return;
          }
          navigation.navigate("RegisterProduct", { scannedCode: rawQrPayload });
          resetScannerState();
        }
      }, 800);
    } catch (error) {
      console.error("Scanning verification failed:", error);
      if (!isMountedRef.current) return;
      setIsCheckingDB(false);
      Alert.alert("Sync Error", "Could not check cloud database.");
      resetScannerState();
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      <View style={styles.maskContainer}>
        <View style={styles.maskRow}>
          <SafeAreaView style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.popToTop()}
              style={styles.backButton}
            >
              <Feather name="x" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Secure Asset Scan</Text>
            <View style={{ width: 40 }} />
          </SafeAreaView>
        </View>

        <View style={styles.centerRow}>
          <View style={styles.sideMask} />

          <View style={styles.targetSquare}>
            <Animated.View
              style={[
                styles.laserLine,
                {
                  transform: [{ translateY: laserTranslateY }],
                  backgroundColor: isAligned ? "#34C759" : "#FF3B30",
                  shadowColor: isAligned ? "#34C759" : "#FF3B30",
                },
              ]}
            />

            <View
              style={[
                styles.corner,
                styles.topLeft,
                { borderColor: isAligned ? "#34C759" : "#FFFFFF" },
              ]}
            />
            <View
              style={[
                styles.corner,
                styles.topRight,
                { borderColor: isAligned ? "#34C759" : "#FFFFFF" },
              ]}
            />
            <View
              style={[
                styles.corner,
                styles.bottomLeft,
                { borderColor: isAligned ? "#34C759" : "#FFFFFF" },
              ]}
            />
            <View
              style={[
                styles.corner,
                styles.bottomRight,
                { borderColor: isAligned ? "#34C759" : "#FFFFFF" },
              ]}
            />
          </View>

          <View style={styles.sideMask} />
        </View>

        <View style={[styles.maskRow, styles.footerRow]}>
          <Text
            style={[
              styles.hintText,
              {
                color: guideText.includes("Multiple")
                  ? "#FF3B30"
                  : isAligned
                    ? "#34C759"
                    : "#E5E5EA",
              },
            ]}
          >
            {guideText}
          </Text>
          {isCheckingDB && (
            <ActivityIndicator
              color="#34C759"
              size="small"
              style={{ marginTop: 12 }}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  fallbackContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  infoText: { color: "#55555C", fontSize: 16 },
  errorText: {
    color: "#55555C",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#6C7075",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  permissionButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  maskContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: "space-between",
  },
  maskRow: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  backButton: { padding: 6 },
  headerText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  centerRow: { flexDirection: "row", height: TARGET_SIZE },
  sideMask: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.65)" },
  targetSquare: {
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    position: "relative",
    backgroundColor: "transparent",
  },
  laserLine: {
    height: 3,
    width: "100%",
    position: "absolute",
    zIndex: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  corner: { position: "absolute", width: 24, height: 24, zIndex: 11 },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  footerRow: {
    paddingBottom: 40,
    justifyContent: "flex-start",
    paddingTop: 40,
  },
  hintText: {
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 40,
    fontWeight: "600",
  },
});
