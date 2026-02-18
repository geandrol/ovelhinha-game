import React from "react";
import StatBar from "./StatBar";

export default function SleepBar({ value }: { value: number }) {
  return <StatBar label="Sono" value={value} />;
}
