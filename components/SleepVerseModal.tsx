import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import * as Speech from "expo-speech";
// @ts-ignore
import Voice from "react-native-voice";
import { getRandomVerse, checkVerseRecognition } from "../constants/verses";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
};

export default function SleepVerseModal({ visible, onDismiss, onSuccess }: Props) {
  const [verse, setVerse] = useState(getRandomVerse());
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [accuracy, setAccuracy] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const listeningTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setVerse(getRandomVerse());
      setRecognizedText("");
      setAccuracy(0);
      setHasAttempted(false);
      setIsListening(false);
      setIsSpeaking(false);
      console.log("Modal de sono aberto com versículo:", verse.reference);
    }

    // Limpar listeners do Voice
    return () => {
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
      Voice.destroy().catch(() => {});
    };
  }, [visible]);

  // Setup Voice recognition listeners
  useEffect(() => {
    Voice.onSpeechStart = () => {
      console.log("🎤 Reconhecimento iniciado");
    };

    Voice.onSpeechRecognized = () => {
      console.log("✅ Fala reconhecida");
    };

    Voice.onSpeechEnd = () => {
      console.log("⏹️ Fala terminou");
      // Não desabilitar aqui - deixar para onSpeechResults processar
    };

    Voice.onSpeechError = (error: any) => {
      console.log("❌ Erro no reconhecimento:", error);
      setIsListening(false);
      
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
      
      Alert.alert(
        "Não entendi bem",
        "Tente ler o versículo novamente com mais clareza.",
        [
          {
            text: "Abrir Configurações",
            onPress: openAppSettings,
          },
          {
            text: "Tentar Novamente",
            onPress: () => {
              setRecognizedText("");
              setAccuracy(0);
              setHasAttempted(false);
            },
          },
          {
            text: "Cancelar",
            onPress: () => {},
            style: "cancel",
          },
        ]
      );
    };

    Voice.onSpeechResults = (result: any) => {
      console.log("📝 Resultados:", result.value);
      
      if (result.value && result.value.length > 0) {
        const text = result.value[0];
        console.log("📖 Texto reconhecido:", text);
        
        setRecognizedText(text);
        setIsListening(false);
        
        if (listeningTimeoutRef.current) {
          clearTimeout(listeningTimeoutRef.current);
        }
        
        // Validar após um pequeno delay para melhor UX
        setTimeout(() => {
          validateVerse(text);
        }, 500);
      } else {
        setIsListening(false);
        Alert.alert("Não entendi", "Por favor, tente ler novamente.");
      }
    };

    Voice.onSpeechPartialResults = (result: any) => {
      console.log("🔄 Resultados parciais:", result.value);
    };

    return () => {
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
      Voice.destroy().catch(() => {});
    };
  }, [verse]);

  async function openAppSettings() {
    try {
      if (Platform.OS === "ios") {
        await Linking.openURL("app-settings:");
      } else {
        await Linking.openSettings();
      }
    } catch (e) {
      console.log("Erro ao abrir configurações:", e);
      Alert.alert("Erro", "Não foi possível abrir as configurações do dispositivo.");
    }
  }

  const startListening = async () => {
    try {
      console.log("🎯 Iniciando reconhecimento...");
      
      // Limpar qualquer sessão anterior
      await Voice.destroy().catch(() => {});
      
      // Pequeno delay para garantir que tudo foi limpo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setIsListening(true);
      setRecognizedText("");
      setAccuracy(0);
      setHasAttempted(false);

      // Iniciar reconhecimento
      await Voice.start("pt-BR");
      
      // Timeout: parar automaticamente após 15 segundos
      listeningTimeoutRef.current = setTimeout(async () => {
        console.log("⏰ Timeout atingido, parando reconhecimento");
        try {
          await Voice.stop();
        } catch (error) {
          console.log("Erro ao parar por timeout:", error);
        }
        setIsListening(false);
      }, 15000);
      
    } catch (error: any) {
      console.log("❌ Erro ao iniciar voz:", error);
      setIsListening(false);
      
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
      
      Alert.alert(
        "Erro ao ativar microfone",
        "Certifique-se de que o microfone está permitido nas permissões do app.\n\nVá em: Configurações > Privacidade > Microfone",
        [
          { text: "Abrir Configurações", onPress: openAppSettings },
          { text: "OK", style: "cancel" },
        ]
      );
    }
  };

  const stopListening = async () => {
    try {
      console.log("🛑 Parando reconhecimento manualmente");
      
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
      
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.log("Erro ao parar voz:", error);
      setIsListening(false);
    }
  };

  const speakVerse = async () => {
    try {
      setIsSpeaking(true);
      
      // Usar await com Speech.speak e adicionar callback para quando terminar
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

  const validateVerse = (spokenText: string) => {
    const acc = checkVerseRecognition(spokenText, verse);
    setAccuracy(acc);
    setHasAttempted(true);

    console.log(`📊 Acurácia: ${acc.toFixed(0)}%`);

    // Se acertar 60% ou mais, considerar como sucesso
    if (acc >= 60) {
      console.log("✅ Sucesso! Acionando sleep");
      setTimeout(() => {
        handleSuccess();
      }, 1000);
    } else {
      console.log("❌ Não acertou. Pedindo para repetir");
      // Mostrar feedback de que não foi bem o suficiente
      const faltam = (60 - acc).toFixed(0);
      Alert.alert(
        "Quase lá! 💪",
        `Você acertou ${acc.toFixed(0)}% do versículo.\nPrecisa de ${faltam}% mais para a cordinha dormir bem.\n\nTente ler novamente com mais cuidado!`,
        [
          {
            text: "Tentar Novamente",
            onPress: () => {
              setRecognizedText("");
              setAccuracy(0);
              setHasAttempted(false);
              console.log("🔄 Tentando novamente...");
            },
          },
          {
            text: "Outro Versículo",
            onPress: () => {
              setVerse(getRandomVerse());
              setRecognizedText("");
              setAccuracy(0);
              setHasAttempted(false);
            },
          },
        ]
      );
    }
  };

  const handleSuccess = () => {
    console.log("🎉 Dormir acionado com sucesso!");
    Alert.alert(
      "Perfeito! 🌙✨",
      `Você acertou ${accuracy.toFixed(0)}% do versículo!\nA cordinha vai dormir feliz e tranquila! 😴💤`,
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
            console.log("Pulando modal de sono");
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
                (isSpeaking || isListening) && styles.disabledButton,
              ]}
              onPress={speakVerse}
              disabled={isSpeaking || isListening}
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

          {hasAttempted && (
            <View
              style={[
                styles.resultContainer,
                accuracy >= 60 ? styles.resultSuccess : styles.resultTrying,
              ]}
            >
              <Text style={styles.recognizedLabel}>O que você leu:</Text>
              <Text style={styles.recognizedText}>{recognizedText}</Text>

              <Text style={styles.accuracyLabel}>
                Acurácia: {accuracy.toFixed(0)}%
              </Text>
              {accuracy >= 60 ? (
                <Text style={styles.successText}>✅ Excelente! Espere um momento...</Text>
              ) : (
                <Text style={styles.tryAgainText}>
                  ❌ Tente novamente! Precisa de {(60 - accuracy).toFixed(0)}% mais
                </Text>
              )}
            </View>
          )}

          {isListening && !hasAttempted && (
            <View style={styles.listeningContainer}>
              <ActivityIndicator size="large" color="#4ade80" />
              <Text style={styles.listeningTitle}>🎤 Ouvindo...</Text>
              <Text style={styles.listeningSubtitle}>Leia o versículo em voz alta agora</Text>
            </View>
          )}

          <View style={styles.instructionContainer}>
            <Text style={styles.instruction}>💪 Toque no botão abaixo para ler em voz alta!</Text>
            <Text style={styles.subInstruction}>
              Leia o versículo claramente para a cordinha dormir bem.
            </Text>
          </View>

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Dicas:</Text>
            <Text style={styles.tipText}>• Toque em "🔊 Ouvir Versículo" para ouvir</Text>
            <Text style={styles.tipText}>• Clique no microfone para começar a ler</Text>
            <Text style={styles.tipText}>• Precisar acertar 60% para a cordinha dormir</Text>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          {!isListening ? (
            <Pressable
              style={[styles.button, styles.micButton]}
              onPress={startListening}
            >
              <Text style={styles.buttonText}>🎤 Começar a Ler</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.button, styles.stopButton]}
              onPress={stopListening}
            >
              <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>⏹️ Parando...</Text>
            </Pressable>
          )}

          {accuracy >= 60 ? (
            <Pressable style={[styles.button, styles.primaryButton]} onPress={handleSuccess}>
              <Text style={styles.buttonText}>✨ Dormir Agora</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setVerse(getRandomVerse())}
            >
              <Text style={styles.secondaryButtonText}>📖 Outro Versículo</Text>
            </Pressable>
          )}

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
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  speakButtonActive: {
    backgroundColor: "rgba(59, 130, 246, 0.5)",
    opacity: 0.8,
  },
  disabledButton: {
    opacity: 0.4,
  },
  speakButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  listeningContainer: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(74, 222, 128, 0.4)",
  },
  listeningTitle: {
    fontSize: 18,
    color: "#4ade80",
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "center",
  },
  listeningSubtitle: {
    fontSize: 14,
    color: "#a7f3d0",
    marginTop: 8,
    textAlign: "center",
  },
  resultContainer: {
    backgroundColor: "rgba(100, 80, 150, 0.2)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
  },
  resultSuccess: {
    borderLeftColor: "rgba(74, 222, 128, 0.8)",
    backgroundColor: "rgba(74, 222, 128, 0.1)",
  },
  resultTrying: {
    borderLeftColor: "rgba(251, 191, 36, 0.8)",
    backgroundColor: "rgba(251, 191, 36, 0.05)",
  },
  recognizedLabel: {
    fontSize: 12,
    color: "#b8a7d9",
    marginBottom: 6,
    fontWeight: "600",
  },
  recognizedText: {
    fontSize: 14,
    color: "#e0d5ff",
    marginBottom: 10,
    fontStyle: "italic",
    lineHeight: 20,
  },
  accuracyLabel: {
    fontSize: 13,
    color: "#c8b8ff",
    marginBottom: 6,
    fontWeight: "700",
  },
  successText: {
    fontSize: 13,
    color: "#4ade80",
    fontWeight: "bold",
  },
  tryAgainText: {
    fontSize: 13,
    color: "#fca5a5",
    fontWeight: "bold",
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
  micButton: {
    backgroundColor: "rgba(139, 92, 246, 0.8)",
  },
  stopButton: {
    backgroundColor: "rgba(239, 68, 68, 0.8)",
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
