const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = "IKne3meq5aSn9XLyUdCD"; // Charlie - conversational male Australian voice

let currentAudio = null;
let queue = [];
let playing = false;
let useElevenLabs = !!API_KEY; // will flip to false if ElevenLabs fails

// Pick a nice female voice for browser fallback
function getBrowserVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  var voices = window.speechSynthesis.getVoices();
  // Prefer: Samantha (Mac), Google UK English Female, any female en voice
  var pick = voices.find(v => v.name.includes("Samantha"))
    || voices.find(v => v.name.includes("Google UK English Female"))
    || voices.find(v => v.name.includes("Google US English"))
    || voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
    || voices.find(v => v.lang.startsWith("en"))
    || null;
  return pick;
}

// Preload voices (some browsers need this)
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

function speakBrowser(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return Promise.resolve();
  return new Promise((resolve) => {
    window.speechSynthesis.cancel(); // clear any pending
    var utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95;
    utt.pitch = 1.05;
    var voice = getBrowserVoice();
    if (voice) utt.voice = voice;
    utt.onend = resolve;
    utt.onerror = resolve;
    window.speechSynthesis.speak(utt);
  });
}

export async function speak(text) {
  if (!text) return;
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
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

async function processQueue() {
  if (queue.length === 0) { playing = false; return; }
  playing = true;
  const text = queue.shift();

  // Try ElevenLabs first
  if (useElevenLabs && API_KEY) {
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

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        currentAudio = new Audio(url);
        await new Promise((resolve) => {
          currentAudio.onended = () => { URL.revokeObjectURL(url); currentAudio = null; resolve(); };
          currentAudio.onerror = () => { URL.revokeObjectURL(url); currentAudio = null; resolve(); };
          currentAudio.play().catch(resolve);
        });
        processQueue();
        return;
      }
      // ElevenLabs failed — fall through to browser TTS
      console.warn("ElevenLabs TTS error:", res.status, "— falling back to browser voice");
      useElevenLabs = false;
    } catch (err) {
      console.warn("ElevenLabs unreachable — falling back to browser voice:", err.message);
      useElevenLabs = false;
    }
  }

  // Browser SpeechSynthesis fallback (always available, free)
  await speakBrowser(text);
  processQueue();
}

export function isTTSAvailable() {
  return !!(API_KEY || (typeof window !== "undefined" && window.speechSynthesis));
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
      // Auto-restart if still supposed to be listening
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
