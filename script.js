const canvas = document.getElementById("celebrationCanvas");
const ctx = canvas.getContext("2d");
const soundButton = document.getElementById("soundButton");
const soundText = document.getElementById("soundText");

const palette = ["#f2c66d", "#e99cab", "#71d7d0", "#f7f3ea"];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const maxParticles = window.innerWidth < 680 ? 80 : 130;
let width = 0;
let height = 0;
let dpr = 1;
let particles = [];
let audioContext;
let masterGain;
let musicTimer;
let isPlaying = false;
let activeOscillators = [];

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, width < 680 ? 1.15 : 1.5);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function createSpark(x, y, color, size = 1) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.4 + Math.random() * 2.8;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 0.45,
    life: 70 + Math.random() * 55,
    maxLife: 125,
    size: size + Math.random() * 1.6,
    color
  };
}

function launchFirework() {
  const x = width * (0.16 + Math.random() * 0.68);
  const y = height * (0.16 + Math.random() * 0.42);
  const color = palette[Math.floor(Math.random() * palette.length)];
  const count = width < 680 ? 12 : 22;

  for (let i = 0; i < count; i += 1) {
    particles.push(createSpark(x, y, color, width < 680 ? 0.65 : 0.85));
  }
  particles = particles.slice(-maxParticles);
}

function createDrift() {
  const color = palette[Math.floor(Math.random() * palette.length)];
  particles.push({
    x: Math.random() * width,
    y: height + 12,
    vx: -0.22 + Math.random() * 0.44,
    vy: -0.38 - Math.random() * 0.42,
    life: 220 + Math.random() * 120,
    maxLife: 340,
    size: 0.8 + Math.random() * 1.9,
    color
  });
}

function drawFrame() {
  if (document.hidden) {
    requestAnimationFrame(drawFrame);
    return;
  }

  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "lighter";

  particles = particles.filter((particle) => particle.life > 0);
  particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.012;
    particle.life -= 1;

    const opacity = Math.max(particle.life / particle.maxLife, 0);
    ctx.beginPath();
    ctx.fillStyle = hexToRgba(particle.color, opacity * 0.85);
    ctx.shadowBlur = width < 680 ? 4 : 8;
    ctx.shadowColor = particle.color;
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = "source-over";

  if (!reducedMotion) {
    requestAnimationFrame(drawFrame);
  }
}

function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function ensureAudio() {
  if (audioContext) {
    return;
  }

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.15;
  masterGain.connect(audioContext.destination);
}

function playTone(frequency, start, duration, type = "sine", volume = 0.42) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.035);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(masterGain);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.04);
  oscillator.addEventListener("ended", () => {
    activeOscillators = activeOscillators.filter((active) => active !== oscillator);
  });
  activeOscillators.push(oscillator);
}

function playBirthdaySong() {
  const now = audioContext.currentTime;
  const notes = [
    [392, 0, 0.24],
    [392, 0.32, 0.24],
    [440, 0.64, 0.52],
    [392, 1.28, 0.52],
    [523.25, 1.92, 0.52],
    [493.88, 2.56, 0.86],
    [392, 3.76, 0.24],
    [392, 4.08, 0.24],
    [440, 4.4, 0.52],
    [392, 5.04, 0.52],
    [587.33, 5.68, 0.52],
    [523.25, 6.32, 0.86],
    [392, 7.52, 0.24],
    [392, 7.84, 0.24],
    [783.99, 8.16, 0.52],
    [659.25, 8.8, 0.52],
    [523.25, 9.44, 0.52],
    [493.88, 10.08, 0.52],
    [440, 10.72, 0.9],
    [698.46, 12, 0.24],
    [698.46, 12.32, 0.24],
    [659.25, 12.64, 0.52],
    [523.25, 13.28, 0.52],
    [587.33, 13.92, 0.52],
    [523.25, 14.56, 1.05]
  ];

  notes.forEach(([frequency, offset, duration]) => {
    playTone(frequency, now + offset, duration);
    playTone(frequency * 2, now + offset + 0.012, duration * 0.48, "triangle", 0.065);
  });
}

function stopSong() {
  window.clearInterval(musicTimer);
  activeOscillators.forEach((oscillator) => {
    try {
      oscillator.stop();
    } catch (error) {
      // The note may already have ended.
    }
  });
  activeOscillators = [];

  if (masterGain) {
    masterGain.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.08);
    window.setTimeout(() => {
      if (masterGain) {
        masterGain.gain.value = 0.15;
      }
    }, 220);
  }
}

async function toggleSound() {
  ensureAudio();

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  isPlaying = !isPlaying;
  soundButton.setAttribute("aria-pressed", String(isPlaying));
  soundText.textContent = isPlaying ? "\u6682\u505c\u795d\u798f" : "\u64ad\u653e\u795d\u798f";

  if (isPlaying) {
    playBirthdaySong();
    launchFirework();
    musicTimer = window.setInterval(() => {
      playBirthdaySong();
      launchFirework();
    }, 16600);
    return;
  }

  stopSong();
}

resizeCanvas();
if (!reducedMotion) {
  drawFrame();
  window.setInterval(launchFirework, 3600);
  window.setInterval(createDrift, 420);
} else {
  launchFirework();
  drawFrame();
}

window.addEventListener("resize", resizeCanvas);
soundButton.addEventListener("click", toggleSound);
