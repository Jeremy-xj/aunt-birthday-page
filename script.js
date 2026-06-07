const canvas = document.getElementById("celebrationCanvas");
const ctx = canvas.getContext("2d");
const soundButton = document.getElementById("soundButton");
const soundText = document.getElementById("soundText");
const soundStatus = document.getElementById("soundStatus");
const birthdayAudio = document.getElementById("birthdayAudio");

const palette = ["#f2c66d", "#e99cab", "#71d7d0", "#f7f3ea"];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const maxParticles = window.innerWidth < 680 ? 80 : 130;
let width = 0;
let height = 0;
let dpr = 1;
let particles = [];
let isPlaying = false;
let isTogglingSound = false;

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

async function toggleSound() {
  if (isTogglingSound) {
    return;
  }
  isTogglingSound = true;

  if (isPlaying) {
    birthdayAudio.pause();
    updateSoundState(false, "\u5df2\u6682\u505c\uff0c\u518d\u70b9\u4e00\u6b21\u7ee7\u7eed\u64ad\u653e\u3002");
    isTogglingSound = false;
    return;
  }

  try {
    birthdayAudio.muted = false;
    birthdayAudio.volume = 1;
    birthdayAudio.load();
    await birthdayAudio.play();
    updateSoundState(true, "\u6b63\u5728\u64ad\u653e\u82f1\u6587\u7248 Happy Birthday\u3002");
    launchFirework();
  } catch (error) {
    updateSoundState(false, "\u624b\u673a\u6d4f\u89c8\u5668\u62e6\u622a\u4e86\u6309\u94ae\u64ad\u653e\uff0c\u8bf7\u76f4\u63a5\u70b9\u4e0b\u65b9\u64ad\u653e\u5668\u7684\u4e09\u89d2\u64ad\u653e\u952e\u3002");
  } finally {
    isTogglingSound = false;
  }
}

function updateSoundState(nextPlaying, message) {
  isPlaying = nextPlaying;
  soundButton.setAttribute("aria-pressed", String(nextPlaying));
  soundText.textContent = nextPlaying ? "\u6682\u505c\u795d\u798f" : "\u64ad\u653e\u795d\u798f";
  soundStatus.textContent = message;
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
birthdayAudio.addEventListener("play", () => {
  updateSoundState(true, "\u6b63\u5728\u64ad\u653e\u82f1\u6587\u7248 Happy Birthday\u3002");
  launchFirework();
});
birthdayAudio.addEventListener("pause", () => {
  if (!birthdayAudio.ended) {
    updateSoundState(false, "\u5df2\u6682\u505c\uff0c\u518d\u70b9\u4e00\u6b21\u7ee7\u7eed\u64ad\u653e\u3002");
  }
});
birthdayAudio.addEventListener("error", () => {
  updateSoundState(false, "\u97f3\u9891\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u5237\u65b0\u9875\u9762\u540e\u518d\u8bd5\u3002");
});
birthdayAudio.addEventListener("ended", () => {
  updateSoundState(false, "\u64ad\u653e\u5b8c\u6210\uff0c\u53ef\u4ee5\u518d\u70b9\u4e00\u6b21\u91cd\u64ad\u3002");
});
