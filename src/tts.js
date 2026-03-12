const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel - calm, clear female voice

let currentAudio = null;
let queue = [];
let playing = false;

export async function speak(text) {
  if (!API_KEY || !text) return;
  queue.push(text);
  if (!playing) processQueue();
}

export function stopSpeaking() {
  queue = [];
  playing = false;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

async function processQueue() {
  if (queue.length === 0) { playing = false; return; }
  playing = true;
  const text = queue.shift();

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!res.ok) {
      console.warn("ElevenLabs TTS error:", res.status);
      processQueue();
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    currentAudio = new Audio(url);
    currentAudio.onended = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      processQueue();
    };
    currentAudio.onerror = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      processQueue();
    };
    currentAudio.play();
  } catch (err) {
    console.warn("ElevenLabs TTS fetch failed:", err);
    processQueue();
  }
}

export function isTTSAvailable() {
  return !!API_KEY;
}
