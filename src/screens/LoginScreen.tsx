// React
import React, { useRef, useState } from "react";

// React Native
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
// Firebase
import { FirebaseError } from "firebase/app";
// Components
import ErrorText from "../components/ErrorText";
import Flaticon from "../components/Flaticon";
// Navigation
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
//Utils
import { isValidEmail, isRequired } from "../utils/validators";
import { getFirebaseLoginError } from "../utils/firebaseErrors";
//Services
import { AuthService } from "../services/AuthService";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    let hasError = false;

    if (!isRequired(cleanEmail)) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!isValidEmail(cleanEmail)) {
      setEmailError("Please enter a valid email address");
      hasError = true;
    }

    if (!isRequired(cleanPassword)) {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (hasError) return;
    setLoading(true);

    try {
      await AuthService.login(cleanEmail, cleanPassword);

      navigation.replace("Dashboard");
    } catch (error: unknown) {
      if (!(error instanceof FirebaseError)) {
        setGeneralError("Something went wrong.");
        return;
      }

      const firebaseError = getFirebaseLoginError(error.code);

      if (firebaseError.emailError) {
        setEmailError(firebaseError.emailError);
      }

      if (firebaseError.passwordError) {
        setPasswordError(firebaseError.passwordError);
      }

      if (firebaseError.generalError) {
        setGeneralError(firebaseError.generalError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);

    const cleanEmail = text.trim();
    if (emailError && cleanEmail && isValidEmail(cleanEmail)) {
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
              <Flaticon name="atSign" size={20} color="#8A8A8F" noFade />
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
              blurOnSubmit={false}
              onSubmitEditing={() => passwordRef.current?.focus()}
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
              ref={passwordRef}
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
              accessibilityRole="button"
              accessibilityLabel={
                secureText ? "Show password" : "Hide password"
              }
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
            accessibilityRole="button"
            accessibilityLabel="Log in"
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
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
  buttonDisabled: {
    opacity: 0.7,
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
