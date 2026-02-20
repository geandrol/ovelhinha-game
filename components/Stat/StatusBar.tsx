import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type Props = {
  value?: number;
  emoji?: string;
  label?: string;
  getEmoji?: (value: number) => string;
  getColor?: (value: number) => string;
};

function getStatusColor(value: number) {
  if (value >= 95) return "#4ADE80";   // verde vibrante
  if (value >= 50) return "#FBBF24";   // amarelo/dourado
  if (value >= 20) return "#FB923C";   // laranja
  return "#EF4444";                    // vermelho
}

export default function StatusBar({ value = 0, emoji, label, getEmoji, getColor }: Props) {
  const safeValue = Math.max(0, Math.min(100, value));
  const animatedWidth = useRef(new Animated.Value(safeValue)).current;

  const displayEmoji = getEmoji ? getEmoji(safeValue) : emoji;
  const displayColor = getColor ? getColor(safeValue) : getStatusColor(safeValue);

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: safeValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [safeValue]);

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        <Text style={styles.emoji}>{displayEmoji}</Text>

        <View style={styles.container}>
          <Animated.View
            style={[
              styles.fill,
              {
                width: widthInterpolated,
                backgroundColor: displayColor,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: "#1F1535",
    fontWeight: "700",
    marginLeft: 8,
    letterSpacing: 0.3,
    textShadowColor: "rgba(255, 255, 255, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emoji: {
    fontSize: 26,
  },
  container: {
    flex: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(200, 150, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  fill: {
    height: "100%",
    borderRadius: 11,
  },
});
