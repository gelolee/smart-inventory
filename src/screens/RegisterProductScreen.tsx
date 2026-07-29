import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Flaticon from "../components/Flaticon";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ProductService,
  type CreateProductDto,
  type UpdateProductDto,
} from "../services/ProductService";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { formatDateMMDDYYYY } from "../utils/date";

const CATEGORIES = ["Supplies", "Equipment", "Furniture"];
const UNITS = ["Piece", "Box", "Pack"];

type Props = NativeStackScreenProps<RootStackParamList, "RegisterProduct">;

export default function AddProductScreen({ route, navigation }: Props) {
  const scannedCode =
    route.params?.scannedCode || route.params?.scannedQr || "";
  const editProduct = route.params?.editProduct || null;
  const isEditMode = !!editProduct;
  const [itemName, setItemName] = useState(editProduct?.itemName || "");
  const [assetCode, setAssetCode] = useState(editProduct?.assetCode || "");
  const [brand, setBrand] = useState(editProduct?.brand || "");
  const [category, setCategory] = useState(editProduct?.category || "");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [unit, setUnit] = useState(editProduct?.unit || "");
  const [isUnitOpen, setIsUnitOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [purchaseDate, setPurchaseDate] = useState(
    editProduct?.purchaseDate || "",
  );
  const [location, setLocation] = useState(editProduct?.location || "");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid =
    itemName.trim() &&
    assetCode.trim() &&
    category &&
    unit &&
    purchaseDate &&
    location.trim();

  const handleValueChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
      setPurchaseDate(formatDateMMDDYYYY(selectedDate));
    }
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
  };

  const handleDismiss = () => {
    setShowDatePicker(false);
  };

  const handleAddProduct = async () => {
    if (isSubmitting) return;
    const cleanItemName = itemName.trim();
    const cleanAssetCode = assetCode.trim();
    const cleanLocation = location.trim();

    if (!cleanItemName || !cleanAssetCode) {
      Alert.alert(
        "Required Fields Missing",
        "Please provide a valid Item Name and Asset Code.",
      );
      return;
    }
    if (!category) {
      Alert.alert(
        "Missing Category",
        "Please select a category for this asset.",
      );
      return;
    }
    if (!unit) {
      Alert.alert("Missing Unit", "Please select a unit of measurement.");
      return;
    }
    if (!purchaseDate) {
      Alert.alert("Missing Purchase Date", "Please select a date of purchase.");
      return;
    }
    if (!cleanLocation) {
      Alert.alert("Missing Location", "Please enter the asset's location.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        if (cleanAssetCode !== editProduct.assetCode) {
          const assetExists = await ProductService.isAssetCodeTaken(
            cleanAssetCode,
            editProduct.id,
          );
          if (assetExists) {
            Alert.alert(
              "Duplicate Asset Code",
              "Another product already uses this asset code.",
            );
            return;
          }
        }
        const updatedProduct: UpdateProductDto = {
          id: editProduct.id,
          itemName: cleanItemName,
          assetCode: cleanAssetCode,
          brand: brand.trim() || "Generic",
          category,
          unit,
          purchaseDate,
          location: cleanLocation,
        };

        await ProductService.updateProduct(updatedProduct);

        const previewProduct = {
          id: editProduct.id,
          itemName: cleanItemName,
          assetCode: cleanAssetCode,
          brand: brand.trim() || "Generic",
          category,
          unit,
          purchaseDate,
          location: cleanLocation,
          qrCode: editProduct.qrCode,
          qrValue: editProduct.qrValue,
        };
        Alert.alert(
          "Updated",
          `"${cleanItemName}" has been updated successfully.`,
          [
            {
              text: "OK",
              onPress: () =>
                navigation.reset({
                  index: 2,
                  routes: [
                    { name: "Dashboard" },
                    { name: "ProductDetails" },
                    {
                      name: "ProductDetailsPreview",
                      params: { product: previewProduct },
                    },
                  ],
                }),
            },
          ],
        );
        return;
      }
      if (!scannedCode) {
        Alert.alert(
          "Missing QR Code",
          "This product must be added by scanning a QR code first.",
        );
        return;
      }
      const qrExists = await ProductService.isQRCodeTaken(scannedCode);
      if (qrExists) {
        Alert.alert(
          "Duplicate Identifier",
          "This QR code has already been assigned to a product in the inventory.",
        );
        return;
      }
      const newProduct: CreateProductDto = {
        itemName: cleanItemName,
        assetCode: cleanAssetCode,
        qrCode: scannedCode,
        brand: brand.trim() || "Generic",
        category,
        unit,
        purchaseDate,
        location: cleanLocation,
      };
      const docRef = await ProductService.saveProduct(newProduct);
      console.log("Document successfully indexed: ", docRef.id);
      Alert.alert(
        "Asset Saved",
        `"${cleanItemName}" has been successfully added to your inventory.`,
        [
          {
            text: "Scan another QR",
            onPress: () => navigation.navigate("QRScannerScreen"),
          },
        ],
      );
      setItemName("");
      setAssetCode("");
      setBrand("");
      setCategory("");
      setUnit("");
      setPurchaseDate("");
      setLocation("");
    } catch (error) {
      console.error("Cloud registry failure: ", error);
      Alert.alert(
        "Database Error",
        "Unable to transmit document data at this time.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBtn}
          >
            <Flaticon name="back" size={24} color="#8A8A8F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? "Edit Product" : "Add Product"}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Dashboard")}
            style={styles.headerBtn}
          >
            <Flaticon name="house" size={24} color="#8A8A8F" />
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Item Name Input */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Item Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputField}
                placeholder="LAPTOP"
                placeholderTextColor="#AEAEB2"
                value={itemName}
                onChangeText={setItemName}
                maxLength={50}
              />
              <Text style={styles.counterText}>{`${itemName.length}/50`}</Text>
            </View>
          </View>

          {/* Asset Code Input */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Asset Code</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputField}
                placeholder="ASYA-1234"
                placeholderTextColor="#AEAEB2"
                value={assetCode}
                onChangeText={setAssetCode}
              />
            </View>
          </View>

          {/* Brand Input */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Brand</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputField}
                placeholder="ASUS"
                placeholderTextColor="#AEAEB2"
                value={brand}
                onChangeText={setBrand}
              />
            </View>
          </View>

          {/* Category Dropdown Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={[
                  styles.inputWrapper,
                  isCategoryOpen && styles.inputWrapperActive,
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  setIsCategoryOpen(!isCategoryOpen);
                  setIsUnitOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    { color: category ? "#1C1C1E" : "#AEAEB2" },
                  ]}
                >
                  {category || "Select Category"}
                </Text>
                <View
                  style={
                    isCategoryOpen ? { transform: [{ rotate: "180deg" }] } : {}
                  }
                >
                  <Flaticon name="dropdown" size={16} color="#8A8A8F" />
                </View>
              </TouchableOpacity>
              {isCategoryOpen && (
                <View style={styles.dropdownPanel}>
                  <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                    contentContainerStyle={styles.panelScrollContent}
                  >
                    {CATEGORIES.map((item) => {
                      const isSelected = category === item;
                      return (
                        <TouchableOpacity
                          key={item}
                          style={[
                            styles.optionRow,
                            isSelected && styles.optionRowSelected,
                          ]}
                          onPress={() => {
                            setCategory(item);
                            setIsCategoryOpen(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              isSelected && styles.optionTextSelected,
                            ]}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {/* Unit of Measurement Dropdown */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Unit of Measurement</Text>
            <View style={[styles.dropdownContainer, { zIndex: 90 }]}>
              <TouchableOpacity
                style={[
                  styles.inputWrapper,
                  isUnitOpen && styles.inputWrapperActive,
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  setIsUnitOpen(!isUnitOpen);
                  setIsCategoryOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    { color: unit ? "#1C1C1E" : "#AEAEB2" },
                  ]}
                >
                  {unit || "Select Unit"}
                </Text>
                <View
                  style={
                    isUnitOpen ? { transform: [{ rotate: "180deg" }] } : {}
                  }
                >
                  <Flaticon name="dropdown" size={16} color="#8A8A8F" />
                </View>
              </TouchableOpacity>
              {isUnitOpen && (
                <View style={styles.dropdownPanel}>
                  <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                    contentContainerStyle={styles.panelScrollContent}
                  >
                    {UNITS.map((item) => {
                      const isSelected = unit === item;
                      return (
                        <TouchableOpacity
                          key={item}
                          style={[
                            styles.optionRow,
                            isSelected && styles.optionRowSelected,
                          ]}
                          onPress={() => {
                            setUnit(item);
                            setIsUnitOpen(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              isSelected && styles.optionTextSelected,
                            ]}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {/* Date of Purchase Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Date of Purchase</Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              activeOpacity={0.8}
              onPress={() => {
                setShowDatePicker(true);
                setIsCategoryOpen(false);
                setIsUnitOpen(false);
                Keyboard.dismiss();
              }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  { color: purchaseDate ? "#1C1C1E" : "#AEAEB2" },
                ]}
              >
                {purchaseDate || "mm/dd/yyyy"}
              </Text>
              <Flaticon name="dropdown" size={16} color="#8A8A8F" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                maximumDate={new Date()}
                onValueChange={handleValueChange}
                onDismiss={handleDismiss}
              />
            )}
          </View>

          {/* Location Input */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Location</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputField}
                placeholder="GLAS, A PLACE"
                placeholderTextColor="#AEAEB2"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          {/* Submit Action Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (isSubmitting || !isFormValid) && { opacity: 0.6 },
            ]}
            onPress={handleAddProduct}
            activeOpacity={0.8}
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditMode ? "Update Product" : "Add Product"}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  keyboardContainer: { flex: 1 },
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
  scrollContent: { paddingHorizontal: 32, paddingBottom: 40 },
  formGroup: { marginBottom: 18 },
  fieldLabel: {
    fontSize: 14,
    fontFamily: "Helvetica-three",
    color: "#6C7075",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#AEAEB2",
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Helvetica-three",
    color: "#1C1C1E",
  },
  counterText: {
    fontSize: 13,
    fontFamily: "Helvetica-three",
    color: "#AEAEB2",
    marginLeft: 8,
  },
  dropdownText: {
    fontSize: 15,
    fontFamily: "Helvetica-three",
  },
  submitButton: {
    backgroundColor: "#6C7075",
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Helvetica-three",
    letterSpacing: 0.3,
  },
  dropdownContainer: { position: "relative", zIndex: 100 },
  inputWrapperActive: { borderColor: "#8A8A8F" },
  dropdownPanel: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#AEAEB2",
    borderRadius: 24,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 200,
  },
  panelScrollContent: { paddingVertical: 12, paddingHorizontal: 12 },
  optionRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 2,
  },
  optionRowSelected: { backgroundColor: "#F2F2F7" },
  optionText: { fontSize: 15, fontFamily: "Helvetica-three", color: "#8E8E93" },
  optionTextSelected: { color: "#3A3F47", fontFamily: "Helvetica-three" },
});
