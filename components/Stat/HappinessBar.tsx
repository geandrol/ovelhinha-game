import React from "react";
import StatBar from "./StatBar";

export default function HappinessBar({ value }: { value: number }) {
  return <StatBar label="Felicidade" value={value} />;
}
