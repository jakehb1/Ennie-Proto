const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = "IKosFDmvNlCwcgcWNJ1r"; // Charlie

let currentAudio = null;
let queue = [];
let playing = false;
let audioUnlocked = false;

// Pre-warm audio on first user interaction so autoplay works
function unlockAudio() {
  if (audioUnlocked) return;
  var a = new Audio();
  a.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
  a.play().then(function () {
    audioUnlocked = true;
    // If there are queued items waiting, start processing
    if (queue.length > 0 && !playing) processQueue();
  }).catch(function () {});
  a.remove();
}

if (typeof window !== "undefined") {
  ["click", "touchstart", "keydown"].forEach(function (evt) {
    window.addEventListener(evt, unlockAudio, { once: false, passive: true });
  });
}

// Cache fetched audio blobs to avoid re-fetching the same text
var audioCache = {};

async function fetchAudio(text) {
  if (audioCache[text]) return audioCache[text];

  var res = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + VOICE_ID, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": API_KEY,
    },
    body: JSON.stringify({
      text: text,
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
    console.error("[Ennie TTS] ElevenLabs error " + res.status + ":", errBody);
    return null;
  }

  var blob = await res.blob();
  audioCache[text] = blob;
  return blob;
}

export async function speak(text) {
  if (!API_KEY || !text) {
    if (!API_KEY) console.warn("[Ennie TTS] No API key — set VITE_ELEVENLABS_API_KEY in .env");
    return;
  }
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
  var text = queue.shift();

  try {
    var blob = await fetchAudio(text);
    if (!blob) { processQueue(); return; }

    var url = URL.createObjectURL(blob);
    currentAudio = new Audio(url);

    await new Promise(function (resolve) {
      currentAudio.onended = function () { URL.revokeObjectURL(url); currentAudio = null; resolve(); };
      currentAudio.onerror = function (e) {
        console.error("[Ennie TTS] Audio playback error:", e);
        URL.revokeObjectURL(url);
        currentAudio = null;
        resolve();
      };
      currentAudio.play().then(function () {
        console.log("[Ennie TTS] Playing Charlie voice for:", text.substring(0, 50) + "...");
      }).catch(function (err) {
        console.warn("[Ennie TTS] Autoplay blocked — will retry after user interaction:", err.message);
        // Put it back at the front of the queue so it plays after unlock
        queue.unshift(text);
        URL.revokeObjectURL(url);
        currentAudio = null;
        playing = false;
        resolve();
      });
    });
    if (playing) processQueue();
  } catch (err) {
    console.error("[Ennie TTS] Fetch failed:", err);
    processQueue();
  }
}

export function isTTSAvailable() {
  return !!API_KEY;
}

// --- Speech Recognition (STT) ---
var SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

export function isSTTAvailable() {
  return !!SpeechRecognition;
}

export function createListener(onResult, onStateChange) {
  if (!SpeechRecognition) return null;
  var rec = new SpeechRecognition();
  rec.continuous = false;
  rec.interimResults = true;
  rec.lang = "en-US";

  var active = false;
  var interim = "";

  rec.onresult = function (e) {
    var final = "";
    interim = "";
    for (var i = 0; i < e.results.length; i++) {
      if (e.results[i].isFinal) {
        final += e.results[i][0].transcript;
      } else {
        interim += e.results[i][0].transcript;
      }
    }
    if (onStateChange) onStateChange({ listening: true, interim: interim });
    if (final) {
      onResult(final.trim());
      interim = "";
    }
  };

  rec.onend = function () {
    if (active) {
      try { rec.start(); } catch (_) {}
    } else {
      if (onStateChange) onStateChange({ listening: false, interim: "" });
    }
  };

  rec.onerror = function (e) {
    if (e.error === "not-allowed") {
      active = false;
      if (onStateChange) onStateChange({ listening: false, interim: "", error: "Microphone access denied" });
    }
  };

  return {
    start: function () {
      if (active) return;
      active = true;
      if (onStateChange) onStateChange({ listening: true, interim: "" });
      try { rec.start(); } catch (_) {}
    },
    stop: function () {
      active = false;
      try { rec.stop(); } catch (_) {}
      if (onStateChange) onStateChange({ listening: false, interim: "" });
    },
    isActive: function () { return active; },
  };
}
