import React from "react";
import StatusBar from "./StatusBar";

type Props = {
  value: number;
};

export default function HungerBar({ value }: Props) {
  return <StatusBar value={value} emoji="🍎" label="Fome" />;
}
