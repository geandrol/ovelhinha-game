import React, { useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Asset } from "expo-asset";

type Action = "idle" | "jump" | "eat";

type Props = {
  size?: number;
  action?: Action;          // ação controlada externamente
  onActionEnd?: () => void; // avisa quando terminar
  onPetTap?: () => void;
};

const HOME_GIF = require("../../assets/images/ovelha/base/home.gif");
const JUMP_GIF = require("../../assets/images/ovelha/base/pulo-ezgif.com-cut.gif");
const EAT_GIF  = require("../../assets/images/ovelha/animações/output-onlinegiftools (3) (1).gif");

const JUMP_MS = 4000;
const EAT_MS = 8000;

export default function Sheep({
  size = 280,
  action = "idle",
  onActionEnd,
  onPetTap,
}: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      await Asset.fromModule(HOME_GIF).downloadAsync();
      await Asset.fromModule(JUMP_GIF).downloadAsync();
      await Asset.fromModule(EAT_GIF).downloadAsync();
    })();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (action === "idle") return;

    const duration = action === "jump" ? JUMP_MS : EAT_MS;

    timerRef.current = setTimeout(() => {
      onActionEnd?.();
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [action]);

  const resolveGif = () => {
    switch (action) {
      case "jump":
        return JUMP_GIF;
      case "eat":
        return EAT_GIF;
      default:
        return HOME_GIF;
    }
  };

  return (
    <Pressable onPress={onPetTap} style={styles.hitbox}>
      <View style={{ width: size, height: size }}>
        <Image
          key={action}
          source={resolveGif()}
          style={styles.layer}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hitbox: { padding: 5 },
  layer: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
