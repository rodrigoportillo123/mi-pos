// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor | undefined;
    webkitSpeechRecognition: SpeechRecognitionConstructor | undefined;
  }
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onstart: () => void;
  onend: () => void;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export type SpeechResult = {
  transcript: string;
};

type Recognition = SpeechRecognition;

function getRecognitionCtor(): SpeechRecognitionConstructor | undefined {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

/**
 * Dictado usando Web Speech API (Chrome/Edge suelen soportar webkitSpeechRecognition).
 * Requiere HTTPS o localhost.
 */
export function startDictation(options?: {
  lang?: string;
  interimResults?: boolean;
  maxAlternatives?: number;
}): Promise<SpeechResult> {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    return Promise.reject(
      new Error("Tu navegador no soporta SpeechRecognition. Usa Chrome/Edge y habilita el micrófono.")
    );
  }

  const recognition: Recognition = new Ctor();
  recognition.lang = options?.lang ?? "es-SV";
  recognition.interimResults = options?.interimResults ?? false;
  recognition.maxAlternatives = options?.maxAlternatives ?? 1;

  return new Promise((resolve, reject) => {
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      reject(new Error(event?.error || "Error de reconocimiento de voz"));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results?.[0]?.[0];
      const transcript = (result?.transcript || "").trim();
      if (!transcript) reject(new Error("No se detectó voz. Intenta de nuevo."));
      else resolve({ transcript });
    };

    recognition.start();
  });
}