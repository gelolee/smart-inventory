import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  Alert,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import Flaticon from "../components/Flaticon";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native";
import { AuthService } from "../services/AuthService";
import { useAuth } from "../hooks/useAuth";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { getTimeBasedGreeting } from "../utils/date";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

const GRID_GAP = 10;
const GRID_HORIZONTAL_PADDING = 20;
const MIN_BUTTON_SIZE = 130;
const MAX_BUTTON_SIZE = 200;

export default function DashboardScreen({ navigation }: Props) {
  const { isAdmin, loading } = useAuth();
  const [logoLoaded, setLogoLoaded] = useState(false);
  const { width, height } = useWindowDimensions();

  const columns = width >= 700 ? 4 : width >= 500 ? 3 : 2;

  const availableWidth =
    width - GRID_HORIZONTAL_PADDING * 4 - GRID_GAP * (columns - 3);
  const rawButtonSize = availableWidth / columns;
  const buttonSize = Math.min(
    Math.max(rawButtonSize, MIN_BUTTON_SIZE),
    MAX_BUTTON_SIZE,
  );

  const buttonRadius = buttonSize * 0.25;
  const iconSize = buttonSize * 0.2;
  const buttonFontSize = Math.max(14, Math.min(18, buttonSize * 0.11));

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await AuthService.logout();
          navigation.replace("Login");
        },
      },
    ]);
  };

  const menuItems = [
    isAdmin && {
      key: "add",
      icon: "qrCode",
      label: "Add QR Code",
      onPress: () => navigation.navigate("AddQr"),
    },
    {
      key: "scan",
      icon: "qrScan",
      label: "Scan QR Tag",
      onPress: () => navigation.navigate("QRScannerScreen"),
    },
    {
      key: "products",
      icon: "box",
      label: "Products",
      onPress: () => navigation.navigate("ProductDetails"),
    },
    isAdmin && {
      key: "inventory",
      icon: "boxes",
      label: "Inventory",
      onPress: () => navigation.navigate("Inventory"),
    },
  ].filter(Boolean) as {
    key: string;
    icon: string;
    label: string;
    onPress: () => void;
  }[];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Inventory</Text>
          <Text style={styles.headerTitleSub}>Dashboard</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
          <Flaticon name="exit" size={24} color="#8E8E93" />
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />

      {/* Greeting */}
      <View style={styles.greetingContainer}>
        {loading ? (
          <>
            <View
              style={[
                styles.skeletonBlock,
                { width: 100, height: 14, marginBottom: 6 },
              ]}
            />
            <View style={[styles.skeletonBlock, { width: 70, height: 22 }]} />
          </>
        ) : (
          <>
            <Text style={styles.greetingText} maxFontSizeMultiplier={1.3}>
              {getTimeBasedGreeting()},{" "}
            </Text>
            <Text style={styles.greetingRole} maxFontSizeMultiplier={1.3}>
              {isAdmin ? "Admin" : "Guest"}!
            </Text>
          </>
        )}
      </View>

      {/* Main Menu Form Content */}
      {loading ? (
        <View style={styles.menuLoadingContainer}>
          <ActivityIndicator size="large" color="#6C7075" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.menuContainer,
            { minHeight: height * 0.4 },
          ]}
        >
          <View style={[styles.grid, { gap: GRID_GAP }]}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.menuButton,
                  {
                    width: buttonSize,
                    height: buttonSize,
                    borderRadius: buttonRadius,
                  },
                ]}
                activeOpacity={0.8}
                onPress={item.onPress}
              >
                <Flaticon
                  name={item.icon}
                  size={iconSize}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text
                  style={[styles.menuButtonText, { fontSize: buttonFontSize }]}
                  maxFontSizeMultiplier={1.2}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      <View style={styles.footer}>
        <View style={styles.logoWrapper}>
          {!logoLoaded && <View style={styles.logoSkeleton} />}
          <Image
            source={require("../../assets/logo/logo-ac.png")}
            style={styles.logoImage}
            onLoad={() => setLogoLoaded(true)}
            fadeDuration={0}
          />
        </View>
      </View>
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
    paddingVertical: 15,
  },
  headerButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#55555C",
    lineHeight: 22,
    fontFamily: "Helvetica-one",
  },
  headerTitleSub: {
    fontSize: 20,
    fontWeight: "600",
    color: "#55555C",
    lineHeight: 22,
    fontFamily: "Helvetica-one",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginHorizontal: 24,
    marginBottom: 20,
  },
  menuContainer: {
    flexGrow: 1,
    paddingHorizontal: GRID_HORIZONTAL_PADDING,
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
  menuButton: {
    flexDirection: "column-reverse",
    backgroundColor: "#6C7075",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  buttonIcon: {
    marginTop: 5,
  },
  menuButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: "Helvetica-three",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  greetingContainer: {
    paddingHorizontal: 20,
    marginTop: -4,
    marginBottom: 15,
  },
  greetingText: {
    fontSize: 20,
    fontFamily: "Helvetica-three",
    color: "#AEAEB2",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  greetingRole: {
    fontSize: 22,
    fontFamily: "Helvetica-two",
    color: "#3A3F47",
    marginTop: 2,
  },
  menuLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  skeletonBlock: {
    backgroundColor: "#E5E5EA",
    borderRadius: 4,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 30,
    width: "100%",
  },
  logoWrapper: {
    width: 140,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: 140,
    height: 80,
    resizeMode: "contain",
  },
  logoSkeleton: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#E5E5EA",
    borderRadius: 8,
  },
});
