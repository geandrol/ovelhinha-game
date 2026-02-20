import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { getRandomVerse } from "../constants/verses";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
};

export default function SleepVerseModal({ visible, onDismiss, onSuccess }: Props) {
  const [verse, setVerse] = useState(getRandomVerse());
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (visible) {
      setVerse(getRandomVerse());
      setIsSpeaking(false);
      console.log("Modal de sono aberto com versículo:", verse.reference);
    }
  }, [visible]);

  const speakVerse = async () => {
    try {
      setIsSpeaking(true);

      return new Promise<void>((resolve) => {
        Speech.speak(verse.text, {
          language: "pt-BR",
          pitch: 1.0,
          rate: 0.9,
          onDone: () => {
            console.log("Leitura do versículo terminada");
            setIsSpeaking(false);
            resolve();
          },
          onError: (error) => {
            console.log("Erro ao ler versículo:", error);
            setIsSpeaking(false);
            resolve();
          },
        });
      });
    } catch (error) {
      console.log("Erro ao falar:", error);
      Alert.alert("Erro", "Não foi possível ler o versículo.");
      setIsSpeaking(false);
    }
  };

  const handleSuccess = () => {
    console.log("🎉 Dormir acionado com sucesso!");
    Alert.alert(
      "Perfeito! 🌙✨",
      "A cordinha vai dormir feliz e tranquila! 😴💤",
      [
        {
          text: "Dormir Agora",
          onPress: () => {
            onSuccess();
            onDismiss();
          },
        },
      ]
    );
  };

  const handleSkip = () => {
    Alert.alert(
      "Pular?",
      "Tem certeza que quer pular a leitura do versículo?",
      [
        {
          text: "Não",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Sim",
          onPress: () => {
            onDismiss();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🌙 Hora de Dormir</Text>
          <Pressable onPress={handleSkip}>
            <Text style={styles.closeBtn}>✕</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.verseContainer}>
            <Text style={styles.verseLabel}>📖 Leia este versículo:</Text>
            <Text style={styles.verseText}>{verse.text}</Text>
            <Text style={styles.reference}>{verse.reference}</Text>

            <Pressable
              style={[
                styles.speakButton,
                isSpeaking && styles.speakButtonActive,
                isSpeaking && styles.disabledButton,
              ]}
              onPress={speakVerse}
              disabled={isSpeaking}
            >
              {isSpeaking ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.speakButtonText}>Lendo...</Text>
                </>
              ) : (
                <Text style={styles.speakButtonText}>🔊 Ouvir Versículo</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.instructionContainer}>
            <Text style={styles.instruction}>💪 Leia o versículo em voz alta!</Text>
            <Text style={styles.subInstruction}>
              Ouça o versículo acima e leia com atenção para a cordinha dormir bem.
            </Text>
          </View>

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Dicas:</Text>
            <Text style={styles.tipText}>• Toque em "🔊 Ouvir Versículo" quantas vezes precisar</Text>
            <Text style={styles.tipText}>• Leia o versículo em voz alta com atenção</Text>
            <Text style={styles.tipText}>• Quando terminar, clique em "Confirmar"</Text>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={handleSuccess}
          >
            <Text style={styles.buttonText}>✅ Confirmar que li</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setVerse(getRandomVerse())}
          >
            <Text style={styles.secondaryButtonText}>📖 Outro Versículo</Text>
          </Pressable>

          <Pressable style={[styles.button, styles.cancelButton]} onPress={handleSkip}>
            <Text style={styles.cancelButtonText}>Fechar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(20, 15, 35, 0.98)",
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  closeBtn: {
    fontSize: 28,
    color: "#b8a7d9",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingVertical: 20,
  },
  verseContainer: {
    backgroundColor: "rgba(100, 80, 150, 0.25)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "rgba(200, 150, 255, 0.6)",
  },
  verseLabel: {
    fontSize: 14,
    color: "#b8a7d9",
    marginBottom: 12,
    fontWeight: "600",
  },
  verseText: {
    fontSize: 18,
    color: "#e0d5ff",
    lineHeight: 28,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 16,
  },
  reference: {
    fontSize: 13,
    color: "#c8b8ff",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 16,
  },
  speakButton: {
    backgroundColor: "rgba(59, 130, 246, 0.7)",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  speakButtonActive: {
    backgroundColor: "rgba(59, 130, 246, 0.5)",
  },
  disabledButton: {
    opacity: 0.6,
  },
  speakButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  instructionContainer: {
    backgroundColor: "rgba(74, 144, 226, 0.15)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instruction: {
    fontSize: 15,
    color: "#e0d5ff",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  subInstruction: {
    fontSize: 13,
    color: "#b8a7d9",
    textAlign: "center",
  },
  tipsContainer: {
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 14,
    color: "#fcd34d",
    fontWeight: "bold",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: "#d0c8ff",
    lineHeight: 20,
    marginBottom: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  primaryButton: {
    backgroundColor: "rgba(74, 222, 128, 0.8)",
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: "rgba(139, 92, 246, 0.6)",
    backgroundColor: "transparent",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "rgba(100, 116, 139, 0.4)",
    backgroundColor: "transparent",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButtonText: {
    color: "#c8b8ff",
    fontWeight: "600",
    fontSize: 14,
  },
  cancelButtonText: {
    color: "#b8a7d9",
    fontWeight: "600",
    fontSize: 14,
  },
});
