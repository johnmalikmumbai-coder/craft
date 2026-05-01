import './style.css'

// CUSTOM CURSOR LOGIC
const cursor = document.getElementById('cursor') as HTMLDivElement | null;
const ring = document.getElementById('cursorRing') as HTMLDivElement | null;

let mx = 0, my = 0, rx = 0, ry = 0;

// Initialize positions
mx = window.innerWidth / 2;
my = window.innerHeight / 2;
rx = mx; ry = my;

document.addEventListener('mousemove', (e: MouseEvent) => {
  mx = e.clientX;
  my = e.clientY;
  if (cursor) {
    cursor.style.left = mx - 4 + 'px';
    cursor.style.top = my - 4 + 'px';
  }
});

function animateCursor() {
  rx += (mx - rx - 22) * 0.15;
  ry += (my - ry - 22) * 0.15;
  if (ring) {
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

// STARS CANVAS BACKGROUND
const canvas = document.getElementById('stars-canvas') as HTMLCanvasElement | null;
const ctx = canvas?.getContext('2d');

function resize() {
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}
resize();
window.addEventListener('resize', resize);

interface Star {
  x: number; y: number; ox: number; oy: number; r: number;
  speed: number; opacity: number; flicker: number;
}

interface Particle {
  x: number; y: number; r: number; vx: number; vy: number;
  opacity: number; color: string;
}

const stars: Star[] = [];
const particles: Particle[] = [];
const starCount = 150;
const particleCount = 25;

for (let i = 0; i < starCount; i++) {
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;
  stars.push({
    x, y, ox: x, oy: y,
    r: Math.random() * 1.5 + 0.5,
    speed: Math.random() * 0.1 + 0.05,
    opacity: Math.random() * 0.5 + 0.2,
    flicker: Math.random() * 0.02 + 0.005
  });
}

for (let i = 0; i < particleCount; i++) {
  particles.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2 + 1,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    opacity: Math.random() * 0.4 + 0.1,
    color: Math.random() > 0.8 ? '#d4762a' : '#ffffff'
  });
}

let t = 0;
function drawBackground() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  t += 0.01;

  stars.forEach(s => {
    const dx = mx - s.x;
    const dy = my - s.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 300;

    if (dist < maxDist) {
      const force = (maxDist - dist) / maxDist;
      const targetX = s.ox + dx * force * 0.1;
      const targetY = s.oy + dy * force * 0.1;
      s.x += (targetX - s.x) * 0.1;
      s.y += (targetY - s.y) * 0.1;
    } else {
      s.x += (s.ox - s.x) * 0.05;
      s.y += (s.oy - s.y) * 0.05;
    }

    s.opacity += Math.sin(t * s.speed * 10) * s.flicker;
    s.opacity = Math.max(0.1, Math.min(0.8, s.opacity));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
    ctx.fill();
  });

  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color.includes('d4') ? `rgba(212,118,42,${p.opacity})` : `rgba(255,255,255,${p.opacity})`;
    ctx.fill();
  });

  requestAnimationFrame(drawBackground);
}
drawBackground();

// SCROLL REVEAL OBSERVER
const revealOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 100);
      observer.unobserve(entry.target);
    }
  });
}, revealOptions);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// NAV & TIMELINE LOGIC
const nav = document.querySelector('nav');
const timelineProgress = document.querySelector('.timeline-progress') as HTMLElement | null;
const timelineLine = document.querySelector('.timeline-line') as HTMLElement | null;

window.addEventListener('scroll', () => {
  if (nav) {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  // Timeline Progress Animation
  if (timelineLine && timelineProgress) {
    const rect = timelineLine.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    let progress = (windowHeight / 2 - rect.top) / rect.height;
    progress = Math.max(0, Math.min(1, progress));
    timelineProgress.style.height = (progress * 100) + '%';
  }
});
