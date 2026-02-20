import { Platform } from "react-native";

export async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS === "web") {
    // No web, o navegador pede permissão automaticamente
    return true;
  }

  if (Platform.OS === "ios") {
    // iOS: usar MediaLibrary (que inclui permission check) ou criar chamada nativa
    // Por enquanto, retornar true e confiar na permissão do app.json
    return true;
  }

  // Android: usar react-native-permissions ou expo-permissions
  // Fallback: retornar true e deixar o SO pedir
  return true;
}
