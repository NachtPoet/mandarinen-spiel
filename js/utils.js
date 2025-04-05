// Hilfsfunktionen und SVG-Icons

// SVG Icons für Musik- und Sound-Buttons
const musicOnIcon = `
  <svg viewBox="0 0 24 24" style="stroke: var(--cell-selected); stroke-width: 1.5; fill: none; stroke-linecap: round; stroke-linejoin: round;">
    <path d="M3 9v6h4l5 5V4L7 9H3z" fill="var(--cell-selected)" />
    <path d="M16.5 7.5a5 5 0 0 1 0 9" />
    <path d="M18.5 5.5a8 8 0 0 1 0 13" />
  </svg>
`;

const musicOffIcon = `
  <svg viewBox="0 0 24 24" style="stroke: #888; stroke-width: 1.5; fill: none; stroke-linecap: round; stroke-linejoin: round;">
    <path d="M3 9v6h4l5 5V4L7 9H3z" fill="#888" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
`;

const soundOnIcon = `
  <svg viewBox="0 0 24 24" style="stroke: var(--cell-selected); stroke-width: 1.5; fill: none; stroke-linecap: round; stroke-linejoin: round;">
    <path d="M2 6h4l4-4v16l-4-4H2z" fill="var(--cell-selected)" />
    <path d="M15 8l3 3m0-3l-3 3" />
  </svg>
`;

const soundOffIcon = `
  <svg viewBox="0 0 24 24" style="stroke: #888; stroke-width: 1.5; fill: none; stroke-linecap: round; stroke-linejoin: round;">
    <path d="M2 6h4l4-4v16l-4-4H2z" fill="#888" />
    <line x1="18" y1="6" x2="12" y2="12" />
    <line x1="12" y1="6" x2="18" y2="12" />
  </svg>
`;

// Funktion zur Farbmanipulation (Verdunkeln einer Farbe)
function darkenColor(hex, percent) {
  hex = hex.replace('#', '');

  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  r = Math.floor(r * (100 - percent) / 100);
  g = Math.floor(g * (100 - percent) / 100);
  b = Math.floor(b * (100 - percent) / 100);

  r = Math.min(255, Math.max(0, r)).toString(16);
  g = Math.min(255, Math.max(0, g)).toString(16);
  b = Math.min(255, Math.max(0, b)).toString(16);

  if (r.length < 2) r = '0' + r;
  if (g.length < 2) g = '0' + g;
  if (b.length < 2) b = '0' + b;

  return '#' + r + g + b;
}

// Bresenham-Algorithmus zur Berechnung von Linien
function bresenhamLine(r0, c0, r1, c1) {
  let points = [];
  let dx = Math.abs(r1 - r0);
  let dy = Math.abs(c1 - c0);
  let sx = (r0 < r1) ? 1 : -1;
  let sy = (c0 < c1) ? 1 : -1;
  let err = dx - dy;

  while (true) {
    points.push({ row: r0, col: c0 });

    if (r0 === r1 && c0 === c1) break;

    let e2 = 2 * err;
    if (e2 > -dy) { err -= dy; r0 += sx; }
    if (e2 < dx) { err += dx; c0 += sy; }
  }

  return points;
}

// Funktion zum Erstellen von Konfetti-Effekten
function createConfetti(count, container = document.body) {
  const colors = ['#ff4136', '#0074D9', '#2ECC40', '#FFDC00', '#B10DC9', '#FF851B', '#ff8c00', '#7FDBFF'];
  const confettiContainer = document.createElement('div');
  confettiContainer.style.position = 'fixed';
  confettiContainer.style.top = '0';
  confettiContainer.style.left = '0';
  confettiContainer.style.width = '100%';
  confettiContainer.style.height = '100%';
  confettiContainer.style.overflow = 'hidden';
  confettiContainer.style.pointerEvents = 'none';
  confettiContainer.style.zIndex = '99';
  container.appendChild(confettiContainer);

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');

    const shapeTypes = ['circle', 'square', 'triangle'];
    const shape = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];

    if (shape === 'circle') {
      confetti.style.borderRadius = '50%';
    } else if (shape === 'triangle') {
      confetti.style.width = '0';
      confetti.style.height = '0';
      confetti.style.borderLeft = `${Math.random() * 5 + 5}px solid transparent`;
      confetti.style.borderRight = `${Math.random() * 5 + 5}px solid transparent`;
      confetti.style.borderBottom = `${Math.random() * 10 + 10}px solid ${colors[Math.floor(Math.random() * colors.length)]}`;
      confetti.style.backgroundColor = 'transparent';
    } else {
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      if (Math.random() < 0.1) {
        confetti.style.backgroundColor = '#ff8c00';
        confetti.style.borderRadius = '50%';
        confetti.style.boxShadow = '0 0 5px rgba(255,140,0,0.8)';
      }
    }

    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = `${Math.random() * 20}%`;
    confetti.style.width = `${Math.random() * 10 + 5}px`;
    confetti.style.height = `${Math.random() * 10 + 5}px`;
    confetti.style.opacity = Math.random();
    confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;

    confettiContainer.appendChild(confetti);
  }

  setTimeout(() => {
    if (document.body.contains(confettiContainer)) {
      document.body.removeChild(confettiContainer);
    }
  }, 5000);
}

// Funktion zur Initialisierung des Sternenhimmels
function initStarField() {
  const starField = document.getElementById('star-field');
  const starCount = 100;

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.classList.add('star');

    const size = Math.random() * 3;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty('--twinkle-duration', `${3 + Math.random() * 5}s`);
    star.style.animationDelay = `${Math.random() * 5}s`;

    starField.appendChild(star);
  }
}

// Funktion zum Auslösen des Memory Flash-Effekts
function triggerMemoryFlash(audioManager) {
  const flash = document.querySelector('.memory-flash');
  flash.style.animation = 'none';

  setTimeout(() => {
    flash.style.animation = 'flash 1.5s forwards';
    if (audioManager) {
      audioManager.playSound('flash');
    }
  }, 10);
}
