import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from "expo-video";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Intro">;

export default function IntroScreen({ navigation }: Props) {
  const [hasNavigated, setHasNavigated] = useState(false);

  const player = useVideoPlayer(
    require("../../assets/video/splash.mp4"),
    (player) => {
      player.play();
    },
  );

  const goToLogin = () => {
    if (hasNavigated) return;
    setHasNavigated(true);
    navigation.replace("Login");
  };

  useEffect(() => {
    const subscription = player.addListener("playToEnd", goToLogin);
    return () => subscription.remove();
  }, [player]);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />

      <SafeAreaView style={styles.skipContainer}>
        <TouchableOpacity
          onPress={goToLogin}
          style={styles.skipButton}
          activeOpacity={0.8}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  video: { flex: 1 },
  skipContainer: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  skipButton: {
    marginTop: 16,
    marginRight: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Helvetica-three",
    fontWeight: "600",
  },
});
