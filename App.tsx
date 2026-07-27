import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";

// Keep the splash screen visible while we fetch our fonts
SplashScreen.preventAutoHideAsync();

export default function App() {
  // Load the Helvetica files from your assets folder
  const [fontsLoaded, error] = useFonts({
    "Helvetica-one": require("./assets/font/HelveticaNeueLTProBdEx.otf"),
    "Helvetica-two": require("./assets/font/HelveticaNeueLTProHvEx.otf"),
    "Helvetica-three": require("./assets/font/HelveticaNeueLTProLtEx.otf"),
  });

  useEffect(() => {
    if (fontsLoaded || error) {
      // Hide the splash screen the moment fonts load (or if an error occurs)
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  // Keep showing the splash screen until fonts are loaded
  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
