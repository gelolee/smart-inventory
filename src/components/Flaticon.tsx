import React from "react";
import { Image, StyleSheet, ImageStyle, StyleProp } from "react-native";

const ICON_MAP: Record<string, any> = {
  // ─── Existing Icons ───
  key: require("../../assets/icons/key.png"),
  house: require("../../assets/icons/home.png"),
  qrCode: require("../../assets/icons/qr-code.png"),
  qrScan: require("../../assets/icons/scanner.png"),
  box: require("../../assets/icons/archive.png"),
  boxes: require("../../assets/icons/package.png"),
  dropdown: require("../../assets/icons/down-arrow.png"),
  back: require("../../assets/icons/left-chevron.png"),
  info: require("../../assets/icons/info.png"),
  edit: require("../../assets/icons/edit.png"),
  check: require("../../assets/icons/check.png"),
  exit: require("../../assets/icons/logout.png"),
  location: require("../../assets/icons/location.png"),
  warning: require("../../assets/icons/warning.png"),
};

interface FlaticonProps {
  name: keyof typeof ICON_MAP;
  size?: number;
  color?: string;
  style?: StyleProp<ImageStyle>;
  noFade?: boolean;
}

export default function Flaticon({
  name,
  size = 24,
  color,
  style,
  noFade = false,
}: FlaticonProps) {
  const source = ICON_MAP[name];

  if (!source) {
    console.warn(`Icon "${name}" does not exist in ICON_MAP.`);
    return null;
  }

  return (
    <Image
      source={source}
      fadeDuration={noFade ? 0 : 300}
      style={[
        { width: size, height: size, resizeMode: "contain" },
        color ? { tintColor: color } : {},
        style,
      ]}
    />
  );
}
