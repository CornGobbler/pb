// Oct 30, 2026 at 3:00 PM PDT (UTC-7)
const RELEASE = new Date("2026-10-30T15:00:00-07:00");

const els = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
};
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad = (n) => String(n).padStart(2, "0");

// Show the release time in the visitor's own timezone
try {
  const local = RELEASE.toLocaleString(undefined, {
    weekday: "long", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  });
  document.getElementById("local").textContent = "That's " + local + " for you";
} catch (e) { /* ignore */ }

function setNum(el, value) {
  if (el.textContent === value) return;
  el.textContent = value;
  if (reduceMotion) return;
  el.classList.remove("bump");
  void el.offsetWidth; // restart animation
  el.classList.add("bump");
}

function tick() {
  const diff = RELEASE - new Date();

  if (diff <= 0) {
    Object.values(els).forEach((el) => setNum(el, "00"));
    document.body.classList.add("live");
    document.getElementById("tagline").textContent = "Practical Basketball is out now. Go hoop!";
    document.getElementById("when").textContent = "Released Friday, October 30 at 3:00 PM PDT";
    document.getElementById("play").hidden = false;
    clearInterval(timer);
    return;
  }

  const s = Math.floor(diff / 1000);
  setNum(els.days, pad(Math.floor(s / 86400)));
  setNum(els.hours, pad(Math.floor((s % 86400) / 3600)));
  setNum(els.minutes, pad(Math.floor((s % 3600) / 60)));
  setNum(els.seconds, pad(s % 60));
}

const timer = setInterval(tick, 1000);
tick();

// ---------- Background parallax (follows mouse / touch) ----------
const bg = document.getElementById("bg");
function parallax(x, y) {
  const dx = (x / window.innerWidth - 0.5) * -24;
  const dy = (y / window.innerHeight - 0.5) * -16;
  bg.style.setProperty("--mx", dx + "px");
  bg.style.setProperty("--my", dy + "px");
}
if (!reduceMotion) {
  window.addEventListener("mousemove", (e) => parallax(e.clientX, e.clientY));
  window.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    parallax(t.clientX, t.clientY);
  }, { passive: true });
}

// ---------- Rising embers ----------
(function embers() {
  if (reduceMotion) return;
  const canvas = document.getElementById("embers");
  const ctx = canvas.getContext("2d");
  let w, h, dpr, parts = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
    const count = Math.round(Math.min(90, window.innerWidth / 14));
    parts = Array.from({ length: count }, () => spawn(true));
  }

  function spawn(anywhere) {
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: (Math.random() * 2 + 0.6) * dpr,
      vy: (Math.random() * 0.6 + 0.25) * dpr,
      sway: Math.random() * Math.PI * 2,
      a: Math.random() * 0.6 + 0.2,
    };
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.y -= p.vy;
      p.sway += 0.015;
      p.x += Math.sin(p.sway) * 0.35 * dpr;
      if (p.y < -10) Object.assign(p, spawn(false));
      const fade = Math.min(1, p.y / (h * 0.35));
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 70, 110, ${p.a * fade})`;
      ctx.shadowColor = "rgba(255, 15, 79, 0.9)";
      ctx.shadowBlur = 8 * dpr;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();
  frame();
})();
