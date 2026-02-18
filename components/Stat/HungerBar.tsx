import React from "react";
import StatBar from "./StatBar";


export default function HungerBar({ value }: { value: number }) {
  return <StatBar label="Fome" value={value} />;
}

