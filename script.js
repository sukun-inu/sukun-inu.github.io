document.addEventListener("DOMContentLoaded", () => {
  const screen = document.querySelector(".loading-screen");
  const logBox = document.querySelector(".loading-log");
  const progressBox = document.querySelector(".loading-progress");
  const tilesBox = document.querySelector(".loading-tiles");

  if (!screen || !logBox || !progressBox) return;

  const barLength = 32;
  const tasks = [
    "Initialization",
    "Fonts & assets",
    "Video buffer",
    "Services data",
    "Contact links",
    "Final checks"
  ];

  let index = 0;
  let progress = 0;
  let revealed = false;
  let tileRunning = false;

  const renderProgress = (pct) => {
    const clamped = Math.min(100, Math.max(0, Math.floor(pct)));
    const pos = Math.min(barLength - 1, Math.floor((clamped / 100) * (barLength - 1)));
    let bar = "";
    for (let i = 0; i < barLength; i += 1) {
      bar += i === pos ? "*" : "-";
    }
    progressBox.textContent = `[${bar}] ${clamped}%`;
  };

  const writeLine = (text, status) => {
    const line = document.createElement("div");
    line.textContent = `> ${text}`;
    if (status === "ok") line.classList.add("ok");
    if (status === "fail") line.classList.add("fail");
    logBox.appendChild(line);
    logBox.scrollTop = logBox.scrollHeight;
  };
  const tileScanReveal = () => {
    if (revealed) return;
    revealed = true;

    if (tilesBox && !tileRunning) {
      tileRunning = true;
      tilesBox.innerHTML = "";
      const rows = Math.max(10, Math.floor(window.innerHeight / 18));
      const cols = Math.max(16, Math.floor(window.innerWidth / 26));
      let longest = 0;

      for (let r = 0; r < rows; r += 1) {
        const row = document.createElement("div");
        row.className = "loading-tile-row";
        for (let c = 0; c < cols; c += 1) {
          const cell = document.createElement("div");
          cell.className = "loading-tile-cell";
          const duration = 0.28 + Math.random() * 0.32;
          const delay = r * 0.02 + c * 0.006 + Math.random() * 0.012;
          cell.style.setProperty("--d", `${duration}s`);
          cell.style.setProperty("--delay", `${delay}s`);
          row.appendChild(cell);
          longest = Math.max(longest, duration + delay);
        }
        tilesBox.appendChild(row);
      }

      screen.classList.add("tile-reveal");
      setTimeout(() => screen.remove(), (longest + 0.35) * 1000);
    } else {
      screen.classList.add("tile-reveal");
      setTimeout(() => screen.remove(), 1100);
    }
  };

  const step = () => {
    const task = tasks[index];
    const increment = Math.max(8, Math.floor(100 / tasks.length));
    progress = Math.min(100, progress + increment);
    renderProgress(progress);
    writeLine(`${task} ... OK`, "ok");
    index += 1;

    if (index < tasks.length) {
      const jitter = 180 + Math.random() * 220;
      setTimeout(step, jitter);
    } else {
      renderProgress(100);
      writeLine("Ready. Launching UI.");
      setTimeout(tileScanReveal, 220);
    }
  };

  writeLine("Booting SYCS client console");
  renderProgress(0);
  setTimeout(step, 180);

  window.addEventListener("load", () => {
    if (progress < 100) {
      progress = 100;
      renderProgress(100);
      writeLine("Load event reached; forcing ready.");
      tileScanReveal();
    }
  });

  /* ===== Scramble Hover Text ===== */
  const scrambleTargets = document.querySelectorAll("[data-scramble]");
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

  scrambleTargets.forEach((el) => {
    const original = el.textContent;
    let raf = null;
    let animating = false;
    let resetTimer = null;

    const scramble = () => {
      if (animating) return;
      let frame = 0;
      const max = Math.max(18, Math.ceil(original.length * 2.2));
      animating = true;
      clearTimeout(resetTimer);

      const tick = () => {
        const revealCount = Math.floor((frame / max) * original.length);
        const chars = original.split("").map((ch, idx) => {
          if (idx < revealCount) return ch;
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        });
        el.textContent = chars.join("");
        frame += 1;
        if (frame <= max) {
          raf = requestAnimationFrame(tick);
        } else {
          animating = false;
          resetTimer = setTimeout(() => {
            el.textContent = original;
          }, 140);
        }
      };

      cancelAnimationFrame(raf);
      tick();
    };

    el.addEventListener("mouseenter", scramble);
    el.addEventListener("focus", scramble);
    el.addEventListener("mouseleave", () => {
      if (animating) return;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { el.textContent = original; }, 80);
    });
    el.addEventListener("blur", () => {
      if (animating) return;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { el.textContent = original; }, 80);
    });
  });
});
