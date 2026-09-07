document.addEventListener("DOMContentLoaded", function () {
  if (typeof renderMathInElement === "function") {
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false }
      ],
      throwOnError: false
    });
  }

  document.querySelectorAll("[data-current-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  addRandomMathDecorations();
});

function addRandomMathDecorations() {
  if (document.body.getAttribute("data-math-backgrounds") === "off") return;
  if (window.matchMedia("print").matches) return;
  if (document.querySelector(".math-decoration-layer")) return;

  const all = [
    "brillouin-torus", "mobius-band", "hopf-fibres", "trefoil-knot",
    "bloch-sphere", "dirac-cone", "euler-winding", "node-braid",
    "surface-code", "toric-code", "fano-plane", "quantum-circuit",
    "syndrome-circuit", "kagome-lattice", "band-contours", "temporal-network"
  ];
  const random = function (min, max) { return min + Math.random() * (max - min); };
  const clamp = function (value, min, max) { return Math.max(min, Math.min(max, value)); };
  const pick = function (list) { return list[Math.floor(Math.random() * list.length)]; };
  const mobile = window.innerWidth <= 720;
  const spacious = window.innerWidth >= 1500 && window.innerHeight >= 820;
  const count = mobile ? 1 : (spacious && Math.random() < 0.35 ? 3 : (Math.random() < 0.18 ? 1 : 2));
  // Uniform sampling without replacement, identical on every decorated page.
  const names = [pick(all)];
  while (names.length < count) names.push(pick(all.filter(function (name) { return !names.includes(name); })));

  const layer = document.createElement("div");
  layer.className = "math-decoration-layer";
  layer.setAttribute("aria-hidden", "true");
  const placed = [];

  names.forEach(function (name) {
    // Sample continuous coordinates: there are no fixed corners or named slots.
    // A gentle margin bias leaves plenty of chances for a central composition.
    // Candidate scoring only discourages clipping and collisions with other art.
    const ratio = random(0.78, 1.18);
    const size = Math.min(window.innerWidth * (mobile ? 0.91 : 0.43), window.innerHeight * 0.8, 610) * ratio;
    let best;
    for (let attempt = 0; attempt < 36; attempt++) {
      const bias = Math.random();
      const u = bias < 0.30 ? random(-0.02, 0.29) : bias < 0.60 ? random(0.71, 1.02) : random(0.15, 0.85);
      const v = random(0.12, 0.96);
      const x = u * window.innerWidth;
      const y = v * window.innerHeight;
      const visibleWidth = Math.max(0, Math.min(window.innerWidth, x + size / 2) - Math.max(0, x - size / 2));
      const visibleHeight = Math.max(0, Math.min(window.innerHeight, y + size / 2) - Math.max(0, y - size / 2));
      const visibility = visibleWidth * visibleHeight / (size * size);
      let score = Math.max(0, 0.6 - visibility) * 8;
      placed.forEach(function (other) {
        const distance = Math.hypot(x - other.u * window.innerWidth, y - other.v * window.innerHeight);
        score += Math.max(0, (size + other.size) * 0.43 - distance) / size * 6;
      });
      if (!best || score < best.score) best = { u: u, v: v, ratio: ratio, size: size, score: score };
      if (score === 0) break;
    }

    // Keep labelled circuit diagrams a little closer to upright. Never mirror
    // topological diagrams: reflection would change handedness and crossing cues.
    const maxAngle = name.includes("circuit") || name === "fano-plane" ? 9 : 19;
    best.angle = random(-maxAngle, maxAngle);
    best.opacity = 0.88 * random(0.25, 0.36) * (["band-contours", "euler-winding", "trefoil-knot"].includes(name) ? 0.8 : 1);
    const item = document.createElement("div");
    item.className = "math-decoration math-motif--" + name;
    item.style.setProperty("--math-rotation", best.angle.toFixed(2) + "deg");
    item.style.setProperty("--math-opacity", best.opacity.toFixed(3));
    const image = document.createElement("img");
    image.alt = "";
    image.width = 640;
    image.height = 640;
    image.decoding = "async";
    image.draggable = false;
    image.addEventListener("error", function () { item.remove(); }, { once: true });
    image.src = "assets/backgrounds/" + name + ".svg";
    item.appendChild(image);
    layer.appendChild(item);
    best.element = item;
    placed.push(best);
  });
  document.body.insertBefore(layer, document.body.firstChild);

  function layout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const narrow = w <= 720;
    placed.forEach(function (entry) {
      const size = Math.min(w * (narrow ? 0.91 : 0.43), h * 0.8, 610) * entry.ratio;
      entry.element.style.width = size.toFixed(2) + "px";
      entry.element.style.left = clamp(entry.u * w, size * 0.18, w - size * 0.18).toFixed(2) + "px";
      entry.element.style.top = clamp(entry.v * h, size * 0.18, h - size * 0.18).toFixed(2) + "px";
    });

    // Follow the actual reading column; opacity stays calm even when an image
    // happens to land behind text. The standalone preview has no reading column.
    const column = document.querySelector(".page-inner");
    if (column) {
      const box = column.getBoundingClientRect();
      const middle = (box.left + box.right) / 2;
      layer.style.setProperty("--math-fade-start", clamp(box.left - 48, 0, w).toFixed(2) + "px");
      layer.style.setProperty("--math-reading-start", clamp(box.left + 70, 0, middle).toFixed(2) + "px");
      layer.style.setProperty("--math-reading-end", clamp(box.right - 70, middle, w).toFixed(2) + "px");
      layer.style.setProperty("--math-fade-end", clamp(box.right + 48, 0, w).toFixed(2) + "px");
      layer.classList.add("math-decoration-layer--reading");
    }
  }
  layout();
  let frame = 0;
  window.addEventListener("resize", function () {
    if (frame) window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(function () { frame = 0; layout(); });
  }, { passive: true });
}
