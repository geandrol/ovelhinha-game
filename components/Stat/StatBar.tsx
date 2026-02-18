import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  label: string;
  value: number;
};

export default function StatBar({ label, value }: Props) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  label: {
    width: 90,
    color: "white",
    opacity: 0.9,
    fontWeight: "600",
  },

  bar: {
    flex: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
    overflow: "hidden",
  },

  fill: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.75)",
  },
});
