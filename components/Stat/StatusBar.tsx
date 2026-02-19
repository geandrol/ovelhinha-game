import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Text } from "react-native";

type Props = {
  value?: number;
  emoji: string;
};

function getStatusColor(value: number) {
  if (value >= 95) return "#00C853";   // verde
  if (value >= 50) return "#FFD600";     // amarelo
  if (value >= 20) return "#FF9100";     // laranja
  return "#D50000";                      // vermelho
}

export default function StatusBar({ value = 0, emoji }: Props) {
  const safeValue = Math.max(0, Math.min(100, value));
  const animatedWidth = useRef(new Animated.Value(safeValue)).current;

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
    <View style={styles.row}>
      <Text style={styles.emoji}>{emoji}</Text>

      <View style={styles.container}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthInterpolated,
              backgroundColor: getStatusColor(safeValue),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emoji: {
    fontSize: 20,
  },
  container: {
    flex: 1,
    height: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});
