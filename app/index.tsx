import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  ImageBackground,
  Pressable,
  Text,
} from "react-native";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HungerBar from "../components/Stat/HungerBar";
import SleepBar from "../components/Stat/SleepBar";
import HappinessBar from "../components/Stat/HappinessBar";
import Sheep from "../components/sheep/Sheep";
import SleepVerseModal from "../components/SleepVerseModal";

import { feedPet, sleepPet, GameState, updateGame } from "../game/gameEngine";

type Action = "idle" | "jump" | "eat" | "refuse" | "sleep";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function Home() {
  const [game, setGame] = useState<GameState | null>(null);
  const [action, setAction] = useState<Action>("idle");
  const [isBusy, setIsBusy] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);

  const breathe = useRef(new Animated.Value(0)).current;
  const jumpSoundRef = useRef<Audio.Sound | null>(null);
  const bgMusicRef = useRef<Audio.Sound | null>(null);
  const sadSoundRef = useRef<Audio.Sound | null>(null);
  const sleepySoundRef = useRef<Audio.Sound | null>(null);
  const wasSadRef = useRef(false);
  const wassleepyRef = useRef(false);

  /* ================= AUDIO CONFIG ================= */

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  }, []);

  /* ================= GAME LOOP ================= */

 useEffect(() => {
  const interval = setInterval(() => {
    setGame((current) => {
      if (!current) return current;
      return updateGame(current);
    });
  }, 60000);

  return () => clearInterval(interval);
}, []);

  /* ================= LOAD GAME ================= */

  useEffect(() => {
    async function loadGame() {
      const saved = await AsyncStorage.getItem("GAME_STATE");

      if (saved) {
        const parsed: GameState = JSON.parse(saved);
        setGame(updateGame(parsed));
      } else {
        setGame({
          hunger: 70,
          sleep: 55,
          happiness: 60,
          lastUpdate: Date.now(),
        });
      }
    }

    loadGame();
  }, []);

  useEffect(() => {
    if (!game) return;
    AsyncStorage.setItem("GAME_STATE", JSON.stringify(game));
  }, [game]);

  /* ================= SOUNDS ================= */

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/images/ovelha/base/pulo.mp3"),
        { volume: 1.0 }
      );

      if (!mounted) {
        await sound.unloadAsync();
        return;
      }

      jumpSoundRef.current = sound;
    })();

    return () => {
      mounted = false;
      jumpSoundRef.current?.unloadAsync();
    };
  }, []);

  async function playJumpSound() {
    await jumpSoundRef.current?.replayAsync();
  }

  async function playEatSound() {
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/images/ovelha/animações/Sheep_Eats_Apple_Animation.mp3")
    );
    await sound.playAsync();
    setTimeout(() => sound.unloadAsync(), 8000);
  }

  async function playRefuseSound() {
  const { sound } = await Audio.Sound.createAsync(
    require("../assets/images/ovelha/animações/Sheep_Refuses_Apple_Animation.mp3")
  );
  await sound.playAsync();
  setTimeout(() => sound.unloadAsync(), 2500);
}

  async function playSadSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/images/ovelha/animações/sad.mp3")
      );
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 3000);
    } catch (error) {
      console.log("Sad sound not available yet");
    }
  }

  async function playSleepySound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/images/ovelha/base/sleepy.mp3")
      );
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 3000);
    } catch (error) {
      console.log("Sleepy sound not available yet");
    }
  }

  /* ================= BACKGROUND MUSIC ================= */

useEffect(() => {
  let mounted = true;

  (async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/images/ovelha/base/Untitled.mp3"),
      {
        isLooping: true,
        volume: 0.09,
        shouldPlay: true,
      }
    );

    if (!mounted) {
      await sound.unloadAsync();
      return;
    }

    bgMusicRef.current = sound;
  })();

  return () => {
    mounted = false;
    bgMusicRef.current?.unloadAsync();
  };
}, []);

  /* ================= STATE SOUNDS ================= */

  // 😢 Toca som quando entra em modo triste
  useEffect(() => {
    if (!game) return;

    const currentIsSad = game.hunger <= 20 || game.happiness <= 20;

    if (currentIsSad && !wasSadRef.current) {
      // Entrou em modo triste
      playSadSound();
      wasSadRef.current = true;
    } else if (!currentIsSad && wasSadRef.current) {
      // Saiu de modo triste
      wasSadRef.current = false;
    }
  }, [game?.hunger, game?.happiness]);

  // 😴 Toca som quando entra em modo sono
  useEffect(() => {
    if (!game) return;

    const currentIsSleepy = game.sleep < 20;

    if (currentIsSleepy && !wassleepyRef.current) {
      // Entrou em modo sono
      playSleepySound();
      wassleepyRef.current = true;
    } else if (!currentIsSleepy && wassleepyRef.current) {
      // Saiu de modo sono
      wassleepyRef.current = false;
    }
  }, [game?.sleep]);


  /* ================= BREATH ANIMATION ================= */

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, []);

  /* ================= ACTIONS ================= */

  async function handleFeed() {
  if (isBusy) return;

  setGame((current) => {
    if (!current) return current;

    // 🚫 Já está cheia
    if (current.hunger >= 95) {
      setAction("refuse");
      setIsBusy(true);
      playRefuseSound();
      return current;
    }

    // 🍎 Alimentar
    setAction("eat");
    setIsBusy(true);
    playEatSound();

    return feedPet(current);
  });
}

  async function handleJump() {
    if (!game || isBusy) return;

    setIsBusy(true);
    setAction("jump");

    await playJumpSound();

    setGame({
      ...game,
      happiness: clamp(game.happiness + 2, 0, 100),
      lastUpdate: Date.now(),
    });
  }

  function handleSleep() {
    if (!game || isBusy) return;

    console.log("Abrindo modal de sono...");
    setShowSleepModal(true);
  }

  function handleSleepSuccess() {
    if (!game) return;

    setAction("sleep");
    setIsBusy(true);

    setGame((current) => {
      if (!current) return current;
      return sleepPet(current);
    });
  }

  /* ================= RENDER ================= */

  if (!game) return null;

  // 😢 Lógica de tristeza: entra se hunger <= 20 OU happiness <= 20
  // Sai quando ambos (hunger > 20 E happiness > 20)
  const isSad = game.hunger <= 20 || game.happiness <= 20;

  // 😴 Lógica de sonolência: entra se sleep < 15
  const isSleepy = game.sleep < 20;

  const sheepAnimStyle = {
    transform: [
      {
        scale: breathe.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.03],
        }),
      },
      {
        translateY: breathe.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -6],
        }),
      },
    ],
  };

  return (
    <ImageBackground
      source={require("../assets/images/lucid-origin_Cute_2D_cartoon_mobile_game_background_vertical_9_16_peaceful_countryside_soft_p-0.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.statsArea}>
          <HungerBar value={game.hunger} />
          <SleepBar value={game.sleep} />
          <HappinessBar value={game.happiness} />
        </View>

        <View style={styles.petArea}>
          <Animated.View style={sheepAnimStyle}>
            <Sheep
              size={400}
              action={action}
              isSad={isSad}
              isSleepy={isSleepy}
              onActionEnd={() => {
                setAction("idle");
                setIsBusy(false);
              }}
              onPetTap={handleJump}
            />
          </Animated.View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionBtn, isBusy && styles.disabledBtn]}
          onPress={handleFeed}
          disabled={isBusy}
        >
          <Text style={styles.actionText}>🍎 Comer</Text>
        </Pressable>

        <Pressable
          style={[styles.actionBtn, isBusy && styles.disabledBtn]}
          onPress={handleSleep}
          disabled={isBusy}
        >
          <Text style={styles.actionText}>😴 Dormir</Text>
        </Pressable>

        <Pressable style={styles.actionBtn}>
          <Text style={styles.actionText}>🎮 Mini jogos</Text>
        </Pressable>
      </View>

      <SleepVerseModal
        visible={showSleepModal}
        onDismiss={() => setShowSleepModal(false)}
        onSuccess={handleSleepSuccess}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, paddingTop: 56, paddingHorizontal: 16 },
  statsArea: { gap: 10 },
  petArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 190,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingBottom: 52,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  disabledBtn: {
    opacity: 0.4,
  },
  actionText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
