const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = "IKosFDmvNlCwcgcWNJ1r"; // Charlie

let currentAudio = null;
let queue = [];
let playing = false;
let audioUnlocked = false;
let audioCtx = null;

// Use AudioContext to reliably unlock audio playback on first user gesture
function unlockAudio() {
  if (audioUnlocked) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    // Create and play a silent buffer to fully unlock
    var buf = audioCtx.createBuffer(1, 1, 22050);
    var src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(audioCtx.destination);
    src.start(0);
    audioUnlocked = true;
    console.log("[Ennie TTS] Audio unlocked via user gesture");
    // Process any waiting queue items
    if (queue.length > 0 && !playing) processQueue();
  } catch (e) {
    console.warn("[Ennie TTS] Audio unlock failed:", e.message);
  }
}

if (typeof window !== "undefined") {
  ["click", "touchstart", "keydown"].forEach(function (evt) {
    window.addEventListener(evt, unlockAudio, { once: false, passive: true });
  });
}

// Cache fetched audio blobs
var audioCache = {};

async function fetchAudio(text, retries) {
  if (audioCache[text]) return audioCache[text];
  if (retries === undefined) retries = 2;

  try {
    console.log("[Ennie TTS] Fetching audio for:", text.substring(0, 60) + (text.length > 60 ? "..." : ""));
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
      if (retries > 0 && (res.status >= 500 || res.status === 429)) {
        console.log("[Ennie TTS] Retrying... (" + retries + " left)");
        await new Promise(function (r) { setTimeout(r, 1500); });
        return fetchAudio(text, retries - 1);
      }
      return null;
    }

    var blob = await res.blob();
    if (blob.size < 100) {
      console.warn("[Ennie TTS] Audio blob too small (" + blob.size + " bytes), likely empty");
      return null;
    }
    console.log("[Ennie TTS] Got audio blob:", blob.size, "bytes");
    audioCache[text] = blob;
    return blob;
  } catch (err) {
    console.error("[Ennie TTS] Network error:", err.message);
    if (retries > 0) {
      console.log("[Ennie TTS] Retrying after network error... (" + retries + " left)");
      await new Promise(function (r) { setTimeout(r, 2000); });
      return fetchAudio(text, retries - 1);
    }
    return null;
  }
}

export async function speak(text) {
  if (!text) return;
  if (!API_KEY) {
    console.warn("[Ennie TTS] No API key — set VITE_ELEVENLABS_API_KEY in .env");
    return;
  }
  console.log("[Ennie TTS] speak() called:", text.substring(0, 50));
  queue.push(text);
  // Only start processing if audio is unlocked, otherwise wait for user gesture
  if (audioUnlocked && !playing) {
    processQueue();
  } else if (!audioUnlocked) {
    console.log("[Ennie TTS] Audio not yet unlocked — queued, will play after user tap/click");
  }
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
  if (!audioUnlocked) {
    console.log("[Ennie TTS] Waiting for audio unlock before playing...");
    playing = false;
    return;
  }
  playing = true;
  var text = queue.shift();

  try {
    var blob = await fetchAudio(text);
    if (!blob) {
      console.warn("[Ennie TTS] No audio blob, skipping:", text.substring(0, 40));
      processQueue();
      return;
    }

    var url = URL.createObjectURL(blob);
    currentAudio = new Audio(url);

    await new Promise(function (resolve) {
      currentAudio.onended = function () {
        console.log("[Ennie TTS] Finished playing:", text.substring(0, 40));
        URL.revokeObjectURL(url);
        currentAudio = null;
        resolve();
      };
      currentAudio.onerror = function (e) {
        console.error("[Ennie TTS] Audio playback error:", e);
        URL.revokeObjectURL(url);
        currentAudio = null;
        resolve();
      };
      currentAudio.play().then(function () {
        console.log("[Ennie TTS] Playing Charlie voice for:", text.substring(0, 50));
      }).catch(function (err) {
        console.warn("[Ennie TTS] Play failed:", err.message);
        // Put back at front of queue for retry after unlock
        queue.unshift(text);
        URL.revokeObjectURL(url);
        currentAudio = null;
        audioUnlocked = false; // Force re-unlock
        playing = false;
        resolve();
      });
    });
    if (playing) processQueue();
  } catch (err) {
    console.error("[Ennie TTS] processQueue error:", err);
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
