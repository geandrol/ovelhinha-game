import React from "react";
import StatusBar from "./StatusBar";

type Props = {
  value: number;
  action?: string;
};

function getSleepEmoji(value: number, action?: string) {
  if (action === "sleep") return "😴";    // Dormindo de verdade
  if (value >= 40) return "😎";            // Acordado
  return "😪";                            // Sonolento
}

function getSleepColor(value: number, action?: string) {
  // Roxo SÓ quando está dormindo de verdade (gif ativo)
  if (action === "sleep") return "#A78BFA";  // roxo claro vibrante
  
  // Cores normais infantis
  if (value >= 40) return "#4ADE80";   // verde vibrante
  if (value >= 20) return "#FBBF24";   // amarelo/dourado
  if (value >= 10) return "#FB923C";   // laranja
  return "#EF4444";                    // vermelho
}

export default function SleepBar({ value, action }: Props) {
  return (
    <StatusBar
      value={value}
      label="Sono"
      getEmoji={(val) => getSleepEmoji(val, action)}
      getColor={(val) => getSleepColor(val, action)}
    />
  );
}
