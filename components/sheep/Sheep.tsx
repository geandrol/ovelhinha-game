import { Asset } from "expo-asset";
import React, { useEffect, useRef } from "react";
import { Image, PanResponder, StyleSheet, View } from "react-native";

type Action = "idle" | "jump" | "eat" | "refuse" | "sleep" | "pet";

type Props = {
  size?: number;
  action?: Action;
  onActionEnd?: () => void;
  onPetTap?: () => void;
  onPet?: () => void;
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
const PET_GIF    = require("../../assets/images/ovelha/animações/carinho.gif");

const JUMP_MS   = 4000;
const EAT_MS    = 8000;
const REFUSE_MS = 8000;
const SLEEP_MS  = 6000;
const PET_MS    = 6000;

export default function Sheep({
  size = 280,
  action = "idle",
  onActionEnd,
  onPetTap,
  onPet,
  isSad = false,
  isSleepy = false,
}: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panResponderRef = useRef<ReturnType<typeof PanResponder.create> | null>(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const lastTapRef = useRef(0);
  const doubleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Criar PanResponder uma única vez
  useEffect(() => {
    if (panResponderRef.current === null) {
      panResponderRef.current = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (evt) => {
          const { nativeEvent } = evt;
          const dx = nativeEvent.pageX - touchStartRef.current.x;
          const dy = nativeEvent.pageY - touchStartRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance > 10;
        },
        onPanResponderGrant: (evt) => {
          const { nativeEvent } = evt;
          touchStartRef.current = { x: nativeEvent.pageX, y: nativeEvent.pageY };
          hasMovedRef.current = false;
        },
        onPanResponderMove: (evt) => {
          const { nativeEvent } = evt;
          const dx = nativeEvent.pageX - touchStartRef.current.x;
          const dy = nativeEvent.pageY - touchStartRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Se moveu mais de 15px, é um swipe
          if (distance > 15 && !hasMovedRef.current) {
            hasMovedRef.current = true;
            onPet?.();
          }
        },
        onPanResponderRelease: () => {
          // Se não moveu muito, é um tap simples
          if (!hasMovedRef.current) {
            const now = Date.now();
            const timeDiff = now - lastTapRef.current;

            // Se o último tap foi há menos de 300ms, é um double tap
            if (timeDiff < 300) {
              if (doubleTapTimerRef.current) {
                clearTimeout(doubleTapTimerRef.current);
              }
              onPetTap?.(); // Double tap = pulo
              lastTapRef.current = 0; // Reset
            } else {
              lastTapRef.current = now;
              // Se passar 300ms sem segundo tap, reseta
              doubleTapTimerRef.current = setTimeout(() => {
                lastTapRef.current = 0;
              }, 300);
            }
          }
          hasMovedRef.current = false;
        },
      });
    }
  }, [onPet, onPetTap]);

  // Limpar timers no unmount
  useEffect(() => {
    return () => {
      if (doubleTapTimerRef.current) clearTimeout(doubleTapTimerRef.current);
    };
  }, []);

  // 🔄 Pré-carregar GIFs
  useEffect(() => {
    (async () => {
      await Asset.fromModule(HOME_GIF).downloadAsync();
      await Asset.fromModule(JUMP_GIF).downloadAsync();
      await Asset.fromModule(EAT_GIF).downloadAsync();
      await Asset.fromModule(REFUSE_GIF).downloadAsync();
      await Asset.fromModule(SAD_GIF).downloadAsync();
      await Asset.fromModule(SLEEPY_GIF).downloadAsync();
      await Asset.fromModule(SLEEP_GIF).downloadAsync();
      await Asset.fromModule(PET_GIF).downloadAsync();
    })();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // ⏱ Controla tempo da animação (não tira sleep automático)
  useEffect(() => {
    if (action === "idle" || action === "sleep") return;

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
      case "pet":
        duration = PET_MS;
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
      case "pet":
        return PET_GIF;
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
    <View
      style={styles.hitbox}
      {...panResponderRef.current?.panHandlers}
    >
      <View style={{ width: size, height: size }}>
        <Image
          key={action}
          source={resolveGif()}
          style={styles.layer}
        />
      </View>
    </View>
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
