const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = "IKosFDmvNlCwcgcWNJ1r"; // Charlie

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
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
      }),
    });

    if (!res.ok) {
      var errBody = "";
      try { errBody = await res.text(); } catch (_) {}
      console.error("ElevenLabs TTS error:", res.status, errBody);
      processQueue();
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    currentAudio = new Audio(url);
    await new Promise((resolve) => {
      currentAudio.onended = () => { URL.revokeObjectURL(url); currentAudio = null; resolve(); };
      currentAudio.onerror = () => { URL.revokeObjectURL(url); currentAudio = null; resolve(); };
      currentAudio.play().catch(resolve);
    });
    processQueue();
  } catch (err) {
    console.warn("ElevenLabs TTS fetch failed:", err);
    processQueue();
  }
}

export function isTTSAvailable() {
  return !!API_KEY;
}

// --- Speech Recognition (STT) ---
const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

export function isSTTAvailable() {
  return !!SpeechRecognition;
}

export function createListener(onResult, onStateChange) {
  if (!SpeechRecognition) return null;
  const rec = new SpeechRecognition();
  rec.continuous = false;
  rec.interimResults = true;
  rec.lang = "en-US";

  let active = false;
  let interim = "";

  rec.onresult = (e) => {
    let final = "";
    interim = "";
    for (let i = 0; i < e.results.length; i++) {
      if (e.results[i].isFinal) {
        final += e.results[i][0].transcript;
      } else {
        interim += e.results[i][0].transcript;
      }
    }
    if (onStateChange) onStateChange({ listening: true, interim });
    if (final) {
      onResult(final.trim());
      interim = "";
    }
  };

  rec.onend = () => {
    if (active) {
      try { rec.start(); } catch (_) {}
    } else {
      if (onStateChange) onStateChange({ listening: false, interim: "" });
    }
  };

  rec.onerror = (e) => {
    if (e.error === "not-allowed") {
      active = false;
      if (onStateChange) onStateChange({ listening: false, interim: "", error: "Microphone access denied" });
    }
  };

  return {
    start() {
      if (active) return;
      active = true;
      if (onStateChange) onStateChange({ listening: true, interim: "" });
      try { rec.start(); } catch (_) {}
    },
    stop() {
      active = false;
      try { rec.stop(); } catch (_) {}
      if (onStateChange) onStateChange({ listening: false, interim: "" });
    },
    isActive() { return active; },
  };
}
