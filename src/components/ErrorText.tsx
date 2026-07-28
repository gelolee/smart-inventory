// components/ErrorText.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Flaticon from "../components/Flaticon";

interface ErrorTextProps {
  message: string;
}

const ErrorText = ({ message }: ErrorTextProps): React.ReactElement | null => {
  if (!message) return null;
  return (
    <View style={styles.container}>
      <Flaticon name="warning" size={16} color="#FF3B30" noFade />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -12,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  text: {
    color: "#FF3B30",
    fontSize: 12,
    marginLeft: 6,
    fontFamily: "Helvetica-three",
  },
});

export default ErrorText;
