import type WebSocket from "ws";
import { DefaultDeepgramClient } from "@deepgram/sdk";
import type { V1Socket } from "@deepgram/sdk/listen/v1";
import { ENV } from "../utils/env";

export type VoiceStreamMessage =
  | { type: "interim"; text: string }
  | { type: "partial"; text: string }
  | { type: "final"; text: string }
  | { type: "error"; message: string };

/**
 * Open a Deepgram streaming connection and proxy audio chunks from the client
 * WebSocket to Deepgram, forwarding transcript events back to the client.
 *
 * Protocol:
 *   client → server: binary audio chunks (MediaRecorder timeslice output)
 *   server → client: VoiceStreamMessage JSON strings
 */
export async function startDeepgramProxy(clientWs: WebSocket, mimeType: string) {
  const deepgram = new DefaultDeepgramClient({ apiKey: ENV.deepgramApiKey });
  const encoding = mimeType.includes("webm") ? "webm-opus" : "linear16";

  const socket = await deepgram.listen.v1.connect({
    Authorization: `Token ${ENV.deepgramApiKey}`,
    model: "nova-2",
    language: "multi",
    punctuate: "true",
    interim_results: "true",
    utterance_end_ms: "1000",
    vad_events: "true",
    encoding,
  });

  const send = (msg: VoiceStreamMessage) => {
    if (clientWs.readyState === clientWs.OPEN) {
      clientWs.send(JSON.stringify(msg));
    }
  };

  socket.on("open", () => {
    clientWs.on("message", (data: Buffer | ArrayBuffer | Buffer[]) => {
      try {
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
        socket.sendMedia(buf);
      } catch {
        // Deepgram socket may have closed
      }
    });
  });

  socket.on("message", (msg: V1Socket.Response) => {
    if (msg.type !== "Results") return;
    const text = msg.channel?.alternatives?.[0]?.transcript ?? "";
    if (!text) return;

    if (msg.is_final && msg.speech_final) {
      send({ type: "final", text });
    } else if (msg.is_final) {
      send({ type: "partial", text });
    } else {
      send({ type: "interim", text });
    }
  });

  socket.on("error", (err: Error) => {
    send({ type: "error", message: err.message });
    clientWs.close();
  });

  clientWs.on("close", () => {
    try { socket.close(); } catch { /* already closed */ }
  });
}

/**
 * Voice transcription helper using internal Speech-to-Text service
 *
 * Frontend implementation guide:
 * 1. Capture audio using MediaRecorder API
 * 2. Upload audio to storage (e.g., S3) to get URL
 * 3. Call transcription with the URL
 *
 * Example usage:
 * ```tsx
 * // Frontend component
 * const transcribeMutation = trpc.voice.transcribe.useMutation({
 *   onSuccess: (data) => {
 *     console.log(data.text); // Full transcription
 *     console.log(data.language); // Detected language
 *     console.log(data.segments); // Timestamped segments
 *   }
 * });
 *
 * // After uploading audio to storage
 * transcribeMutation.mutate({
 *   audioUrl: uploadedAudioUrl,
 *   language: 'en', // optional
 *   prompt: 'Transcribe the meeting' // optional
 * });
 * ```
 */
export type TranscribeOptions = {
  audioUrl: string; // URL to the audio file (e.g., S3 URL)
  language?: string; // Optional: specify language code (e.g., "en", "es", "zh")
  prompt?: string; // Optional: custom prompt for the transcription
};

// Native Whisper API segment format
export type WhisperSegment = {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
};

// Native Whisper API response format
export type WhisperResponse = {
  task: "transcribe";
  language: string;
  duration: number;
  text: string;
  segments: WhisperSegment[];
};

export type TranscriptionResponse = WhisperResponse; // Return native Whisper API response directly

export type TranscriptionError = {
  error: string;
  code:
    | "FILE_TOO_LARGE"
    | "INVALID_FORMAT"
    | "TRANSCRIPTION_FAILED"
    | "UPLOAD_FAILED"
    | "SERVICE_ERROR";
  details?: string;
};

/**
 * Transcribe an in-memory audio buffer directly (skips URL download step).
 */
export async function transcribeAudioBuffer(
  buffer: Buffer,
  mimeType: string,
  opts?: { language?: string; prompt?: string }
): Promise<TranscriptionResponse | TranscriptionError> {
  if (!ENV.forgeApiUrl) {
    return { error: "Voice transcription service is not configured", code: "SERVICE_ERROR", details: "BUILT_IN_FORGE_API_URL is not set" };
  }
  if (!ENV.forgeApiKey) {
    return { error: "Voice transcription service authentication is missing", code: "SERVICE_ERROR", details: "BUILT_IN_FORGE_API_KEY is not set" };
  }

  const sizeMB = buffer.length / (1024 * 1024);
  if (sizeMB > 16) {
    return { error: "Audio file exceeds maximum size limit", code: "FILE_TOO_LARGE", details: `File size is ${sizeMB.toFixed(2)}MB, maximum allowed is 16MB` };
  }

  const formData = new FormData();
  const filename = `audio.${getFileExtension(mimeType)}`;
  formData.append("file", new Blob([new Uint8Array(buffer)], { type: mimeType }), filename);
  formData.append("model", "whisper-1");
  formData.append("response_format", "verbose_json");
  const prompt = opts?.prompt || (opts?.language ? `Transcribe the user's voice to text, the user's working language is ${getLanguageName(opts.language)}` : "Transcribe the user's voice to text");
  formData.append("prompt", prompt);

  try {
    const baseUrl = ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`;
    const response = await fetch(new URL("v1/audio/transcriptions", baseUrl).toString(), {
      method: "POST",
      headers: { authorization: `Bearer ${ENV.forgeApiKey}`, "Accept-Encoding": "identity" },
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return { error: "Transcription service request failed", code: "TRANSCRIPTION_FAILED", details: `${response.status} ${response.statusText}${errorText ? `: ${errorText}` : ""}` };
    }
    const whisperResponse = (await response.json()) as WhisperResponse;
    if (!whisperResponse.text || typeof whisperResponse.text !== "string") {
      return { error: "Invalid transcription response", code: "SERVICE_ERROR", details: "Transcription service returned an invalid response format" };
    }
    return whisperResponse;
  } catch (error) {
    return { error: "Voice transcription failed", code: "SERVICE_ERROR", details: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

/**
 * Transcribe audio to text using the internal Speech-to-Text service
 *
 * @param options - Audio data and metadata
 * @returns Transcription result or error
 */
export async function transcribeAudio(
  options: TranscribeOptions
): Promise<TranscriptionResponse | TranscriptionError> {
  try {
    // Step 1: Validate environment configuration
    if (!ENV.forgeApiUrl) {
      return {
        error: "Voice transcription service is not configured",
        code: "SERVICE_ERROR",
        details: "BUILT_IN_FORGE_API_URL is not set",
      };
    }
    if (!ENV.forgeApiKey) {
      return {
        error: "Voice transcription service authentication is missing",
        code: "SERVICE_ERROR",
        details: "BUILT_IN_FORGE_API_KEY is not set",
      };
    }

    // Step 2: Download audio from URL
    let audioBuffer: Buffer;
    let mimeType: string;
    try {
      const response = await fetch(options.audioUrl);
      if (!response.ok) {
        return {
          error: "Failed to download audio file",
          code: "INVALID_FORMAT",
          details: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      audioBuffer = Buffer.from(await response.arrayBuffer());
      mimeType = response.headers.get("content-type") || "audio/mpeg";

      // Check file size (16MB limit)
      const sizeMB = audioBuffer.length / (1024 * 1024);
      if (sizeMB > 16) {
        return {
          error: "Audio file exceeds maximum size limit",
          code: "FILE_TOO_LARGE",
          details: `File size is ${sizeMB.toFixed(2)}MB, maximum allowed is 16MB`,
        };
      }
    } catch (error) {
      return {
        error: "Failed to fetch audio file",
        code: "SERVICE_ERROR",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // Step 3: Create FormData for multipart upload to Whisper API
    const formData = new FormData();

    // Create a Blob from the buffer and append to form
    const filename = `audio.${getFileExtension(mimeType)}`;
    const audioBlob = new Blob([new Uint8Array(audioBuffer)], {
      type: mimeType,
    });
    formData.append("file", audioBlob, filename);

    formData.append("model", "whisper-1");
    formData.append("response_format", "verbose_json");

    // Add prompt - use custom prompt if provided, otherwise generate based on language
    const prompt =
      options.prompt ||
      (options.language
        ? `Transcribe the user's voice to text, the user's working language is ${getLanguageName(options.language)}`
        : "Transcribe the user's voice to text");
    formData.append("prompt", prompt);

    // Step 4: Call the transcription service
    const baseUrl = ENV.forgeApiUrl.endsWith("/")
      ? ENV.forgeApiUrl
      : `${ENV.forgeApiUrl}/`;

    const fullUrl = new URL("v1/audio/transcriptions", baseUrl).toString();

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "Accept-Encoding": "identity",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return {
        error: "Transcription service request failed",
        code: "TRANSCRIPTION_FAILED",
        details: `${response.status} ${response.statusText}${errorText ? `: ${errorText}` : ""}`,
      };
    }

    // Step 5: Parse and return the transcription result
    const whisperResponse = (await response.json()) as WhisperResponse;

    // Validate response structure
    if (!whisperResponse.text || typeof whisperResponse.text !== "string") {
      return {
        error: "Invalid transcription response",
        code: "SERVICE_ERROR",
        details: "Transcription service returned an invalid response format",
      };
    }

    return whisperResponse; // Return native Whisper API response directly
  } catch (error) {
    // Handle unexpected errors
    return {
      error: "Voice transcription failed",
      code: "SERVICE_ERROR",
      details:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Helper function to get file extension from MIME type
 */
function getFileExtension(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "audio/webm": "webm",
    "audio/mp3": "mp3",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/wave": "wav",
    "audio/ogg": "ogg",
    "audio/m4a": "m4a",
    "audio/mp4": "m4a",
  };

  return mimeToExt[mimeType] || "audio";
}

/**
 * Helper function to get full language name from ISO code
 */
function getLanguageName(langCode: string): string {
  const langMap: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese",
    ar: "Arabic",
    hi: "Hindi",
    nl: "Dutch",
    pl: "Polish",
    tr: "Turkish",
    sv: "Swedish",
    da: "Danish",
    no: "Norwegian",
    fi: "Finnish",
  };

  return langMap[langCode] || langCode;
}

/**
 * Example tRPC procedure implementation:
 *
 * ```ts
 * // In server/routers.ts
 * import { transcribeAudio } from "./_core/voiceTranscription";
 *
 * export const voiceRouter = router({
 *   transcribe: protectedProcedure
 *     .input(z.object({
 *       audioUrl: z.string(),
 *       language: z.string().optional(),
 *       prompt: z.string().optional(),
 *     }))
 *     .mutation(async ({ input, ctx }) => {
 *       const result = await transcribeAudio(input);
 *
 *       // Check if it's an error
 *       if ('error' in result) {
 *         throw new TRPCError({
 *           code: 'BAD_REQUEST',
 *           message: result.error,
 *           cause: result,
 *         });
 *       }
 *
 *       // Optionally save transcription to database
 *       await db.insert(transcriptions).values({
 *         userId: ctx.user.id,
 *         text: result.text,
 *         duration: result.duration,
 *         language: result.language,
 *         audioUrl: input.audioUrl,
 *         createdAt: new Date(),
 *       });
 *
 *       return result;
 *     }),
 * });
 * ```
 */
