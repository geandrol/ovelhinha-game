import React, { useEffect, useRef } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Asset } from "expo-asset";

type Action = "idle" | "jump" | "eat" | "refuse" | "sleep";

type Props = {
  size?: number;
  action?: Action;
  onActionEnd?: () => void;
  onPetTap?: () => void;
  isSad?: boolean;
  isSleepy?: boolean;
};

const HOME_GIF   = require("../../assets/images/ovelha/base/home.gif");
const JUMP_GIF   = require("../../assets/images/ovelha/base/pulo-ezgif.com-cut.gif");
const EAT_GIF    = require("../../assets/images/ovelha/animações/Sheep_Eats_Apple_Animation.gif");
const REFUSE_GIF = require("../../assets/images/ovelha/animações/Sheep_Refuses_Apple_Animation.gif");
const SAD_GIF    = require("../../assets/images/ovelha/animações/Tristeza_e_Depressão_em_Vídeo.gif");
const SLEEPY_GIF = require("../../assets/images/ovelha/animações/Cute_Sheep_Animation_Request.gif");
const SLEEP_GIF  = require("../../assets/images/ovelha/animações/Animated_Sleeping_Sheep_Video.gif");

const JUMP_MS   = 4000;
const EAT_MS    = 8000;
const REFUSE_MS = 8000;
const SLEEP_MS  = 6000;

export default function Sheep({
  size = 280,
  action = "idle",
  onActionEnd,
  onPetTap,
  isSad = false,
  isSleepy = false,
}: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 🔄 Pré-carregar GIFs
  useEffect(() => {
    (async () => {
      await Asset.fromModule(HOME_GIF).downloadAsync();
      await Asset.fromModule(JUMP_GIF).downloadAsync();
      await Asset.fromModule(EAT_GIF).downloadAsync();
      await Asset.fromModule(REFUSE_GIF).downloadAsync();
      await Asset.fromModule(SAD_GIF).downloadAsync();
      await Asset.fromModule(SLEEPY_GIF).downloadAsync();
    })();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // ⏱ Controla tempo da animação
  useEffect(() => {
    if (action === "idle") return;

    let duration = 0;

    switch (action) {
      case "jump":
        duration = JUMP_MS;
        break;
      case "eat":
        duration = EAT_MS;
        break;
      case "refuse":
        duration = REFUSE_MS;
        break;
      case "sleep":
        duration = SLEEP_MS;
        break;
    }

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
      case "refuse":
        return REFUSE_GIF;
      case "sleep":
        return SLEEP_GIF;
      default:
        // Ordem de prioridade quando idle:
        // 1. Sonolenta (sleep < 15)
        // 2. Triste (hunger <= 20 || happiness <= 20)
        // 3. Normal
        if (isSleepy) return SLEEPY_GIF;
        if (isSad) return SAD_GIF;
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
