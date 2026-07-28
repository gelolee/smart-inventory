import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import Flaticon from "../components/Flaticon";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import ErrorText from "../components/ErrorText";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    const cleanEmail = email.trim();
    const cleanPassword = password;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let hasError = false;

    if (!cleanEmail) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!emailRegex.test(cleanEmail)) {
      setEmailError("Please enter a valid email address");
      hasError = true;
    }

    if (!cleanPassword) {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (hasError) return;
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      setLoading(false);
      navigation.replace("Dashboard");
    } catch (error: any) {
      setLoading(false);

      switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setGeneralError("Incorrect email or password. Please try again.");
          break;
        case "auth/invalid-email":
          setEmailError("The email format is invalid.");
          break;
        case "auth/too-many-requests":
          setGeneralError(
            "Too many failed login attempts. Please try again later.",
          );
          break;
        default:
          setGeneralError(
            "Unable to sign in right now. Please check your internet connection.",
          );
          break;
      }
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);

    const cleanEmail = text.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailError && cleanEmail && emailRegex.test(cleanEmail)) {
      setEmailError("");
    }

    // Always clear general error when user types
    if (generalError) {
      setGeneralError("");
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);

    if (passwordError && text.trim()) {
      setPasswordError("");
    }

    if (generalError) {
      setGeneralError("");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.formContainer}>
          {/* Title */}
          <Text style={styles.loginTitle}>Log in</Text>

          {/* Email Address Input */}
          <View style={[styles.inputWrapper, emailError && styles.inputError]}>
            <View style={styles.iconContainer}>
              <Feather name="at-sign" size={20} color="#8A8A8F" />
            </View>
            <TextInput
              style={styles.inputField}
              placeholder="E-mail address"
              placeholderTextColor="#8A8A8F"
              value={email}
              onChangeText={handleEmailChange}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              editable={!loading}
              returnKeyType="next"
              textContentType="emailAddress"
              autoComplete="email"
            />
          </View>

          <ErrorText message={emailError} />

          {/* Password Input */}
          <View
            style={[styles.inputWrapper, passwordError && styles.inputError]}
          >
            <View style={styles.iconContainer}>
              <Flaticon name="key" size={20} />
            </View>
            <TextInput
              style={styles.inputField}
              placeholder="Password"
              placeholderTextColor="#8A8A8F"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={secureText}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              textContentType="password"
              autoComplete="current-password"
            />
            {/* Password visibility toggle */}
            <TouchableOpacity
              onPress={() => setSecureText(!secureText)}
              style={styles.eyeIconContainer}
              disabled={loading}
            >
              <Feather
                name={secureText ? "eye-off" : "eye"}
                size={20}
                color="#8A8A8F"
              />
            </TouchableOpacity>
          </View>

          <ErrorText message={passwordError} />

          {generalError ? (
            <View style={styles.generalErrorContainer}>
              <Flaticon name="warning" size={16} color="#FF3B30" noFade />
              <Text style={styles.generalErrorText}>{generalError}</Text>
            </View>
          ) : null}

          {/* Log In Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Get Started</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Image
          source={require("../../assets/logo/logo-ac.png")}
          style={styles.logoImage}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "space-between",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 35,
    marginTop: -40,
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: "600",
    color: "#55555C",
    marginBottom: 40,
    fontFamily: Platform.OS === "ios" ? "Helvetica-one" : "Helvetica-one",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7C7CC",
    borderRadius: 25,
    height: 52,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
  },
  inputError: {
    borderColor: "#FF3B30",
    borderWidth: 1.5,
  },
  iconContainer: {
    width: 32,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  inputField: {
    flex: 1,
    color: "#1C1C1E",
    fontSize: 16,
    fontWeight: "400",
    height: "100%",
    fontFamily: "Helvetica-three",
  },
  eyeIconContainer: {
    paddingHorizontal: 5,
  },
  generalErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    marginTop: -14,
  },
  generalErrorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginLeft: 8,
    fontFamily: "Helvetica-three",
    flex: 1,
  },
  loginButton: {
    backgroundColor: "#6C7075",
    height: 52,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "500",
    fontFamily: "Helvetica-three",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 30,
    width: "100%",
  },
  logoImage: {
    width: 140,
    height: 80,
    resizeMode: "contain",
  },
});
