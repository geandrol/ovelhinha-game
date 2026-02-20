# Dev-client / Build Nativo — Teste de Microfone (react-native-voice)

Este documento descreve passos detalhados para gerar um dev-client (ou build nativo) a fim de testar reconhecimento de voz (`react-native-voice`) no seu dispositivo Android. O `Expo Go` não suporta módulos nativos adicionais; por isso é necessário um dev-client ou build nativo.

**Pré-requisitos**

- Node.js (versão compatível com seu projeto)
- npm ou yarn
- Android SDK (incluindo `platform-tools`) e `adb` no PATH
- Conta Expo (para builds EAS)
- EAS CLI (instalaremos abaixo)
- Se você já tiver o `Expo Go` instalado, remova-o do seu dispositivo para evitar conflitos com o dev-client

**O que este README cobre**

- Instalar o EAS CLI e dependências
- Gerar um dev-client local (`expo prebuild` + `expo run:android`) ou via EAS (`eas build`)
- Instalar o APK no dispositivo
- Iniciar Metro em modo dev-client e conectar o app
- Permissões e verificação de microfone
- Troubleshooting básico

---

## 1) Instalar EAS CLI e dependências

No diretório do projeto:

```bash
# Instale EAS CLI (se ainda não tiver)
npm install -g eas-cli

# Faça login na sua conta Expo
eas login

# Instale dependências do projeto
npm install

# Instale (ou confirme) expo-dev-client
npx expo install expo-dev-client
```

> Observação: o `expo-dev-client` já foi adicionado ao `package.json` do projeto.

## 2) Preparar e rodar o app em modo nativo (opções)

Opção A — Prebuild + Run (local, requer Android SDK):

```bash
# Gera projetos nativos (android/ios) compatíveis com dependências nativas
npx expo prebuild

# Constrói e instala no dispositivo Android conectado (USB debugging ativo)
npx expo run:android
```

Opção B — Build dev-client via EAS (sem configuração local completa):

```bash
# Gera um build dev-client (APK) usando EAS
# Profile 'development' está presente em eas.json
eas build -p android --profile development
```

- Após o build, baixe o APK gerado pelo EAS e instale com `adb install <arquivo.apk>` ou instale manualmente no dispositivo.

## 3) Iniciar Metro em modo dev-client

Depois de instalar o dev-client no dispositivo, inicie o Metro em modo dev-client:

```bash
expo start --dev-client
```

Abra o app dev-client no dispositivo; ele deve detectar o servidor Metro automaticamente. Se não detectar, aponte manualmente para o endereço mostrado no terminal.

## 4) Permissões de Microfone

- Verifique `Configurações > Apps > <seu-app> > Permissões > Microfone` e permita o acesso.
- No Android, se a permissão não aparecer, tente reinstalar o app ou reiniciar o dispositivo.
- O projeto já inclui as entradas de uso de microfone (em `app.json`) mas um build nativo é necessário para que `react-native-voice` funcione corretamente.

## 5) Testando o reconhecimento (procedimento)

1. Abra o app dev-client no dispositivo e navegue até a tela/modal que usa reconhecimento de voz.
2. Toque em "🔊 Ouvir Versículo" (TTS) para verificar se a leitura funciona.
3. Toque em "🎤 Começar a Ler" para ativar o reconhecimento e fale o versículo.
4. Observe o retorno na UI; também cheque logs no terminal Metro.

Para logs nativos e erros detalhados, use `adb logcat`:

```bash
# Ver logs filtrando por tags
adb logcat | grep -i react-native-voice
# ou usar logs gerais do React Native
adb logcat *:S ReactNative:V ReactNativeJS:V
```

## 6) Troubleshooting

- Erro: "Não foi possível ativar microfone" — verifique se o app instalado é realmente o dev-client buildado (não o Expo Go) e se a permissão foi concedida.
- Se o reconhecimento não iniciar: garanta que o `react-native-voice` foi ligado no build nativo (prebuild/eas build) e que não existem versões conflitantes.
- Se `npx expo run:android` falhar: confirme `ANDROID_SDK_ROOT`/`ANDROID_HOME` e se as plataformas foram instaladas no Android Studio.
- Para iOS: após `npx expo prebuild` rode `cd ios && pod install` e use um Mac com Xcode para rodar/simular.

## 7) Testes alternativos (quando não for possível build nativo)

- Teste no navegador (expo web) e implemente um fallback com a Web Speech API (SpeechRecognition) para validar a UX sem STT nativo.
- `expo-speech` (TTS) funciona no Expo Go e no web; se TTS funcionar mas STT não, o problema é nativo.

## 8) Comandos úteis resumidos

```bash
# Login e install
npm install -g eas-cli
eas login
npm install
npx expo install expo-dev-client

# Opção local
npx expo prebuild
npx expo run:android

# Opção EAS
eas build -p android --profile development
# instalar APK gerado no dispositivo (após download)
adb install path/to/app.apk

# Iniciar Metro em dev-client
expo start --dev-client

# Ver logs nativos
adb logcat | grep -i react-native-voice
```

## 9) Posso ajudar com:

- Modularizar `components/SleepVerseModal.tsx` para verificar permissões antes de chamar `Voice.start()`;
- Implementar fallback Web Speech API para `Platform.OS === 'web'` (testes no navegador);
- Gerar instruções EAS mais avançadas (keystore, upload automatizado, profiles de produção).

---

Se quiser, aplico agora a checagem de permissão no `components/SleepVerseModal.tsx` ou monto um `README-DEVCLIENT.md` ainda mais detalhado com screenshots e passos de conta Expo/EAS.