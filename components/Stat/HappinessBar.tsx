import React from "react";
import StatusBar from "./StatusBar";

type Props = {
  value: number;
};

function getHappinessEmoji(value: number) {
  if (value >= 30) return "😊";  // Feliz
  return "😢";                    // Triste
}

function getHappinessColor(value: number) {
  if (value >= 70) return "#4ADE80";   // verde vibrante
  if (value >= 50) return "#FBBF24";   // amarelo/dourado
  if (value >= 30) return "#FB923C";   // laranja
  return "#EF4444";                    // vermelho
}

export default function HappinessBar({ value }: Props) {
  return (
    <StatusBar
      value={value}
      label="Felicidade"
      getEmoji={getHappinessEmoji}
      getColor={getHappinessColor}
    />
  );
}
