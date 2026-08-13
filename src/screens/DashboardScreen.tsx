import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  Alert,
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

export default function DashboardScreen({ navigation }: Props) {
  const { isAdmin, loading } = useAuth();
  const [logoLoaded, setLogoLoaded] = useState(false);

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
            <Text style={styles.greetingText}>{getTimeBasedGreeting()}, </Text>
            <Text style={styles.greetingRole}>
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
        <View style={styles.menuContainer}>
          <View style={styles.grid}>
            {/* Add Product Button — Admin only */}
            {isAdmin && (
              <TouchableOpacity
                style={styles.menuButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate("AddQr")}
              >
                <Flaticon
                  name="qrCode"
                  size={40}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.menuButtonText}>Add QR Code</Text>
              </TouchableOpacity>
            )}

            {/* QR Code Button */}
            <TouchableOpacity
              style={styles.menuButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("QRScannerScreen")}
            >
              <Flaticon
                name="qrScan"
                size={40}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.menuButtonText}>Scan QR Tag</Text>
            </TouchableOpacity>

            {/* Products Button */}
            <TouchableOpacity
              style={styles.menuButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("ProductDetails")}
            >
              <Flaticon
                name="box"
                size={40}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.menuButtonText}>Products</Text>
            </TouchableOpacity>

            {/* Catalog Button — Admin only */}
            {isAdmin && (
              <TouchableOpacity
                style={styles.menuButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate("Inventory")}
              >
                <Flaticon
                  name="boxes"
                  size={40}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.menuButtonText}>Inventory</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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
    borderBottomWidth: 0,
    borderBottomColor: "#E5E5EA",
  },
  headerButton: {
    padding: 5,
  },
  headerButtonSpacer: {
    padding: 5,
    width: 34,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#55555C",
    textAlign: "left",
    lineHeight: 22,
    fontFamily: Platform.OS === "ios" ? "Helvetica-one" : "Helvetica-one",
  },
  headerTitleSub: {
    fontSize: 20,
    fontWeight: "600",
    color: "#55555C",
    textAlign: "left",
    lineHeight: 22,
    fontFamily: Platform.OS === "ios" ? "Helvetica-one" : "Helvetica-one",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginHorizontal: 24,
    marginBottom: 20,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  menuButton: {
    flexDirection: "column-reverse",
    backgroundColor: "#6C7075",
    height: 160,
    width: "45%",
    borderRadius: 40,
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
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Helvetica-three",
    letterSpacing: 0.3,
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
