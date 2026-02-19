import React from "react";
import StatusBar from "./StatusBar";

type Props = {
  value: number;
};

export default function SleepBar({ value }: Props) {
  return <StatusBar value={value} emoji="😴" />;
}
