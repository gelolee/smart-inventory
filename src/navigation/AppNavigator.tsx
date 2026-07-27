import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import AddQrCode from "../screens/AddQrCode";
import PrintPreviewScreen from "../screens/PrintPreviewScreen";
import RegisterProductScreen from "../screens/RegisterProductScreen";
import QRScannerScreen from "../screens/QRScannerScreen";
import ProductDetails from "../screens/ProductDetailsScreen";
import ProductDetailsPreview from "../screens/ProductDetailsPreview";
import InventoryScreen from "../screens/CatalogScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddQr"
        component={AddQrCode}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrintPreview"
        component={PrintPreviewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RegisterProduct"
        component={RegisterProductScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QRScannerScreen"
        component={QRScannerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetailsPreview"
        component={ProductDetailsPreview}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
