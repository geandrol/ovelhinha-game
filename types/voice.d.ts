declare module 'react-native-voice' {
  interface VoiceModule {
    onSpeechStart?: () => void;
    onSpeechRecognized?: () => void;
    onSpeechEnd?: () => void;
    onSpeechError?: (error: any) => void;
    onSpeechResults?: (result: any) => void;
    onSpeechPartialResults?: (result: any) => void;
    start: (language: string) => Promise<void>;
    stop: () => Promise<void>;
    destroy: () => Promise<void>;
    isRecognizing: () => Promise<boolean>;
  }

  const Voice: VoiceModule;
  export default Voice;
}
