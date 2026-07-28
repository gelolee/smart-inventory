export type RootStackParamList = {
  Intro: undefined;
  Login: undefined;
  Dashboard: undefined;
  AddQr: undefined;
  PrintPreview: { quantity?: number } | undefined;
  RegisterProduct:
    | {
        scannedCode?: string;
        scannedQr?: string;
        editProduct?: {
          id: string;
          itemName: string;
          assetCode: string;
          brand: string;
          category: string;
          unit: string;
          purchaseDate: string;
          location?: string;
          qrCode?: string;
          qrValue?: string;
        };
      }
    | undefined;
  QRScannerScreen: undefined;
  ProductDetails: undefined;
  ProductDetailsPreview: {
    product: {
      id: string;
      itemName: string;
      assetCode: string;
      brand: string;
      category: string;
      unit: string;
      purchaseDate: string;
      location?: string;
      qrCode?: string;
      qrValue?: string;
    };
  };
  Inventory: undefined;
};
