const loginButton = document.getElementById("login-button");
const keypad = document.getElementById("keypad");
const keypadGrid = document.getElementById("keypad-grid");
const keypadStage = document.getElementById("keypad-stage");
const pulseFill = document.getElementById("pulse-fill");
const meterLabel = document.querySelector(".meter-label");
const meterNote = document.querySelector(".meter-note");
const statValues = document.querySelectorAll(".stat-value");
const statLabels = document.querySelectorAll(".stat-label");

const keys = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "@",
  "#",
  "*",
  "?",
  "!",
  "%",
  "+",
  "-",
  "=",
  "/",
  "_",
  ".",
  ":",
  ";",
];

const fixedPasswordHash = "d682ed4ca4d989c134ec94f1551e1ec580dd6d5a6ecde9f3d35e6e4a717fbde4";
const fixedPasswordLength = 12;
const authKey = "password-entry-auth";
let inputBuffer = "";

let lastMove = null;
let currentPos = { x: 24, y: 24 };
let velocityBoost = 0;
let pulseTarget = 72;
let infoTimer = null;
let pulseTimer = null;
const stagePadding = 0;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function buildKeypad() {
  keypadGrid.innerHTML = "";
  const shuffled = shuffle([...keys]);
  shuffled.forEach((key) => {
    const button = document.createElement("div");
    button.className = "keypad-key";
    button.textContent = key;
    button.addEventListener("click", () => {
      handleInput(key);
      buildKeypad();
    });
    keypadGrid.appendChild(button);
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function moveKeypadAway(cursorX, cursorY, speed) {
  const stageRect = keypadStage.getBoundingClientRect();
  const keypadRect = keypad.getBoundingClientRect();

  const centerX = keypadRect.left + keypadRect.width / 2;
  const centerY = keypadRect.top + keypadRect.height / 2;

  const dx = centerX - cursorX;
  const dy = centerY - cursorY;
  const distance = Math.max(1, Math.hypot(dx, dy));

  const intensity = clamp(0.25 + speed / 1200, 0.25, 1.2);
  const step = clamp(140 * intensity, 80, 220);

  const moveX = (dx / distance) * step;
  const moveY = (dy / distance) * step;

  const maxX = stageRect.width - keypadRect.width - stagePadding;
  const maxY = stageRect.height - keypadRect.height - stagePadding;

  currentPos.x = clamp(currentPos.x + moveX, stagePadding, Math.max(stagePadding, maxX));
  currentPos.y = clamp(currentPos.y + moveY, stagePadding, Math.max(stagePadding, maxY));

  keypad.style.left = `${currentPos.x}px`;
  keypad.style.top = `${currentPos.y}px`;
}

function onPointerMove(event) {
  if (!keypad.classList.contains("active")) return;

  const now = performance.now();
  if (lastMove) {
    const dt = Math.max(16, now - lastMove.time);
    const dx = event.clientX - lastMove.x;
    const dy = event.clientY - lastMove.y;
    const speed = Math.hypot(dx, dy) / (dt / 1000);
    velocityBoost = clamp(speed, 0, 1200);
  }

  const distanceToKeypad = Math.hypot(
    event.clientX - (keypad.getBoundingClientRect().left + keypad.offsetWidth / 2),
    event.clientY - (keypad.getBoundingClientRect().top + keypad.offsetHeight / 2)
  );

  if (distanceToKeypad < 220) {
    moveKeypadAway(event.clientX, event.clientY, velocityBoost);
  }

  lastMove = { x: event.clientX, y: event.clientY, time: now };
}

function activateKeypad() {
  buildKeypad();
  keypad.classList.add("active");
  keypadStage.setAttribute("aria-hidden", "false");
  currentPos = {
    x: stagePadding,
    y: stagePadding,
  };
  keypad.style.left = `${currentPos.x}px`;
  keypad.style.top = `${currentPos.y}px`;
}

function startLoginCardNoise() {
  const meterLabels = [
    "Signal drift",
    "Auth entropy",
    "Cipher flux",
    "Noise floor",
    "Input variance",
  ];
  const meterNotes = [
    "Calibration window: active.",
    "Randomizer is warming up.",
    "Entropy feed stabilized.",
    "Noise scrubbing complete.",
    "Adaptive shuffle engaged.",
  ];
  const valuePool = ["07", "12", "19", "23", "31", "44", "58", "71", "88", "96"];
  const labelPool = ["Vectors", "Reroutes", "Zones", "Keys", "Pulses", "Batches"];

  if (infoTimer) clearInterval(infoTimer);
  infoTimer = setInterval(() => {
    if (meterLabel) meterLabel.textContent = meterLabels[Math.floor(Math.random() * meterLabels.length)];
    if (meterNote) meterNote.textContent = meterNotes[Math.floor(Math.random() * meterNotes.length)];
    if (statValues.length >= 2) {
      statValues[0].textContent = valuePool[Math.floor(Math.random() * valuePool.length)];
      statValues[1].textContent = valuePool[Math.floor(Math.random() * valuePool.length)];
    }
    if (statLabels.length >= 2) {
      statLabels[0].textContent = labelPool[Math.floor(Math.random() * labelPool.length)];
      statLabels[1].textContent = labelPool[Math.floor(Math.random() * labelPool.length)];
    }
  }, 2600);

  if (pulseTimer) clearInterval(pulseTimer);
  pulseTimer = setInterval(() => {
    const delta = (Math.random() * 8 + 2) * (Math.random() > 0.5 ? 1 : -1);
    pulseTarget = Math.min(92, Math.max(36, pulseTarget + delta));
    if (pulseFill) pulseFill.style.width = `${pulseTarget.toFixed(0)}%`;
  }, 1800);
}

async function handleInput(char) {
  if (!char) return;
  if (inputBuffer.length < fixedPasswordLength) {
    inputBuffer += char;
  } else {
    inputBuffer = inputBuffer.slice(1) + char;
  }
  await checkAuth();
}

async function checkAuth() {
  if (inputBuffer.length === 0) return;
  const buffer = new TextEncoder().encode(inputBuffer);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const digest = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  if (digest === fixedPasswordHash) {
    showSuccess();
  }
}

function showSuccess() {
  sessionStorage.setItem(authKey, "true");
  window.location.href = "success.html";
}

loginButton.addEventListener("click", () => {
  activateKeypad();
});

window.addEventListener("mousemove", onPointerMove);
window.addEventListener("resize", () => {
  if (!keypad.classList.contains("active")) return;
  currentPos.x = clamp(
    currentPos.x,
    stagePadding,
    keypadStage.clientWidth - keypad.offsetWidth - stagePadding
  );
  currentPos.y = clamp(
    currentPos.y,
    stagePadding,
    keypadStage.clientHeight - keypad.offsetHeight - stagePadding
  );
  keypad.style.left = `${currentPos.x}px`;
  keypad.style.top = `${currentPos.y}px`;
});

startLoginCardNoise();
