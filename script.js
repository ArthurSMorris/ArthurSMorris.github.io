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
  initPhotoLightbox();
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
  const titles = {
    "brillouin-torus": "Brillouin torus",
    "mobius-band": "Möbius band",
    "hopf-fibres": "Linked Hopf fibres",
    "trefoil-knot": "Trefoil knot",
    "bloch-sphere": "Bloch sphere",
    "dirac-cone": "Conical band crossing",
    "euler-winding": "Winding-two texture",
    "node-braid": "Band-node braid",
    "surface-code": "Surface-code stabilizers",
    "toric-code": "Toric-code lattice",
    "fano-plane": "Fano plane",
    "quantum-circuit": "GHZ preparation circuit",
    "syndrome-circuit": "Stabilizer measurement",
    "kagome-lattice": "Kagome lattice",
    "band-contours": "Band-energy contours",
    "temporal-network": "Temporal network"
  };
  const random = function (min, max) { return min + Math.random() * (max - min); };
  const clamp = function (value, min, max) { return Math.max(min, Math.min(max, value)); };
  const pick = function (list) { return list[Math.floor(Math.random() * list.length)]; };
  const compactLayout = window.matchMedia("(max-width: 720px), (hover: none) and (pointer: coarse)");
  const mobile = compactLayout.matches;
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
    const item = document.createElement("a");
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
    best.name = name;
    best.element = item;
    placed.push(best);
  });
  // Put these optional links after the page's normal keyboard navigation.
  document.body.appendChild(layer);

  const hoverInput = window.matchMedia("(hover: hover) and (pointer: fine)");
  function updateInteractivity() {
    const enabled = hoverInput.matches;
    layer.classList.toggle("math-decoration-layer--interactive", enabled);
    document.body.classList.toggle("has-math-links", enabled);
    if (enabled) layer.removeAttribute("aria-hidden");
    else layer.setAttribute("aria-hidden", "true");
    placed.forEach(function (entry) {
      const link = entry.element;
      if (enabled) {
        link.setAttribute("href", "graphics.html#" + entry.name);
        link.setAttribute("aria-label", "Read about " + titles[entry.name]);
        link.setAttribute("title", titles[entry.name] + " — read the explanation");
        link.removeAttribute("tabindex");
      } else {
        if (document.activeElement === link) link.blur();
        link.removeAttribute("href");
        link.removeAttribute("aria-label");
        link.removeAttribute("title");
        link.setAttribute("tabindex", "-1");
      }
    });
  }
  updateInteractivity();
  hoverInput.addEventListener("change", updateInteractivity);

  let mobileLayoutWidth = null;
  function layout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const narrow = compactLayout.matches;

    // Mobile browsers fire resize while their address bar opens or closes on
    // scroll. Keep the existing pixel coordinates and size for height-only
    // changes, including late font loading; reflow only for a new screen width
    // or after switching between mobile and desktop layouts.
    if (narrow && mobileLayoutWidth === w) return;
    if (!narrow) mobileLayoutWidth = null;
    const column = document.querySelector(".page-inner");

    if (narrow) {
      // Keep the drawing in the fixed background, centered behind the reading
      // column rather than in the off-screen margins. Fit its entire rotated
      // canvas below the header and inside the viewport.
      const box = column ? column.getBoundingClientRect() : { left: 16, right: w - 16 };
      const header = document.querySelector(".site-header");
      const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
      const top = clamp(headerBottom + 16, 16, Math.max(16, h - 32));
      const bottom = h - 16;
      const availableWidth = Math.min(box.right, w - 16) - Math.max(box.left, 16);
      const size = Math.max(0, Math.min(availableWidth, bottom - top, 520)) * 0.9;
      const halfFootprint = size * (Math.cos(Math.PI / 30) + Math.sin(Math.PI / 30)) / 2;
      const x = clamp((box.left + box.right) / 2, 16 + halfFootprint, w - 16 - halfFootprint);
      const intro = column && column.querySelector(".lede");
      const introBox = intro && intro.getBoundingClientRect();
      const desiredY = introBox && introBox.bottom > top && introBox.top < bottom
        ? (introBox.top + introBox.bottom) / 2 : (top + bottom) / 2;
      const y = clamp(desiredY, top + halfFootprint, bottom - halfFootprint);
      layer.classList.remove("math-decoration-layer--reading");
      placed.forEach(function (entry) {
        entry.element.style.width = size.toFixed(2) + "px";
        entry.element.style.left = x.toFixed(2) + "px";
        entry.element.style.top = y.toFixed(2) + "px";
      });
      mobileLayoutWidth = w;
      return;
    }

    // Restore the same randomized arrangement when returning to a wider screen.
    placed.forEach(function (entry) {
      const size = Math.min(w * (narrow ? 0.91 : 0.43), h * 0.8, 610) * entry.ratio;
      entry.element.style.width = size.toFixed(2) + "px";
      entry.element.style.left = clamp(entry.u * w, size * 0.18, w - size * 0.18).toFixed(2) + "px";
      entry.element.style.top = clamp(entry.v * h, size * 0.18, h - size * 0.18).toFixed(2) + "px";
    });

    // Follow the actual reading column; opacity stays calm even when an image
    // happens to land behind text. The standalone preview has no reading column.
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
  function scheduleLayout() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(function () { frame = 0; layout(); });
  }
  window.addEventListener("resize", scheduleLayout, { passive: true });
  compactLayout.addEventListener("change", scheduleLayout);
  if (document.fonts) document.fonts.ready.then(scheduleLayout);
}


function initPhotoLightbox() {
  const galleryImages = Array.from(document.querySelectorAll(".misc-photo img"));
  const contactImages = Array.from(document.querySelectorAll(".copenhagen-figure img"));
  const images = galleryImages.length ? galleryImages : contactImages;
  if (!images.length) return;

  const isGallery = galleryImages.length > 1;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let currentIndex = 0;
  let lastTrigger = null;
  let navigationToken = 0;
  let savedBodyPaddingRight = "";
  let savedBodyOverflow = "";

  const overlay = document.createElement("div");
  overlay.className = "photo-lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Enlarged photograph");
  overlay.setAttribute("aria-hidden", "true");
  overlay.hidden = true;

  const figure = document.createElement("figure");
  figure.className = "photo-lightbox-figure";

  const enlargedImage = document.createElement("img");
  enlargedImage.className = "photo-lightbox-image";
  enlargedImage.alt = "";
  enlargedImage.decoding = "async";
  enlargedImage.draggable = false;

  const caption = document.createElement("figcaption");
  caption.className = "photo-lightbox-caption";

  const closeButton = makeLightboxButton("photo-lightbox-close", "Close enlarged photograph", "×");
  const previousButton = makeLightboxButton("photo-lightbox-arrow photo-lightbox-arrow--previous", "Previous photograph", "‹");
  const nextButton = makeLightboxButton("photo-lightbox-arrow photo-lightbox-arrow--next", "Next photograph", "›");

  figure.appendChild(enlargedImage);
  figure.appendChild(caption);
  overlay.appendChild(figure);
  overlay.appendChild(closeButton);
  if (isGallery) {
    overlay.appendChild(previousButton);
    overlay.appendChild(nextButton);
  }
  document.body.appendChild(overlay);

  images.forEach(function (image, index) {
    image.classList.add("photo-lightbox-trigger");
    image.setAttribute("tabindex", "0");
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", image.alt ? "Enlarge photograph: " + image.alt : "Enlarge photograph");

    image.addEventListener("click", function () { openLightbox(index, image); });
    image.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(index, image);
      }
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  if (isGallery) {
    previousButton.addEventListener("click", function () { showAdjacent(-1); });
    nextButton.addEventListener("click", function () { showAdjacent(1); });
  }

  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) closeLightbox();
  });

  document.addEventListener("keydown", function (event) {
    if (!overlay.classList.contains("photo-lightbox--open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeLightbox();
    } else if (isGallery && event.key === "ArrowLeft") {
      event.preventDefault();
      showAdjacent(-1);
    } else if (isGallery && event.key === "ArrowRight") {
      event.preventDefault();
      showAdjacent(1);
    }
  });

  function makeLightboxButton(className, label, symbol) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.setAttribute("aria-label", label);
    button.textContent = symbol;
    return button;
  }

  function getSourceRect(image) {
    const crop = image.closest(".misc-cycling-image");
    return (crop || image).getBoundingClientRect();
  }

  function getCaption(image) {
    const sourceCaption = image.closest("figure") && image.closest("figure").querySelector("figcaption");
    return sourceCaption ? sourceCaption.innerHTML : "";
  }

  function setLightboxContent(index) {
    const source = images[index];
    enlargedImage.src = source.currentSrc || source.src;
    enlargedImage.alt = source.alt || "";
    caption.innerHTML = getCaption(source);
    caption.hidden = !caption.textContent.trim();
  }

  function openLightbox(index, trigger) {
    currentIndex = index;
    lastTrigger = trigger;
    navigationToken += 1;
    // The enlarged image stays hidden after a close so it can never leak a
    // full-size frame while the overlay is being torn down. Only reveal it
    // when a new opening actually begins.
    enlargedImage.style.visibility = "";
    overlay.hidden = false;
    overlay.classList.remove("photo-lightbox--closing");
    // Clear any previous image animation before laying out the next opening.
    enlargedImage.getAnimations().forEach(function (animation) { animation.cancel(); });
    setLightboxContent(index);

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    savedBodyPaddingRight = document.body.style.paddingRight;
    savedBodyOverflow = document.body.style.overflow;
    if (scrollbarWidth > 0) document.body.style.paddingRight = scrollbarWidth + "px";
    document.body.style.overflow = "hidden";

    overlay.setAttribute("aria-hidden", "false");
    overlay.classList.add("photo-lightbox--open");

    const sourceRect = getSourceRect(trigger);
    requestAnimationFrame(function () {
      const targetRect = enlargedImage.getBoundingClientRect();
      if (!reducedMotion.matches && targetRect.width && targetRect.height) {
        const sourceCenterX = sourceRect.left + sourceRect.width / 2;
        const sourceCenterY = sourceRect.top + sourceRect.height / 2;
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;
        enlargedImage.animate([
          {
            transform: "translate(" + (sourceCenterX - targetCenterX) + "px, " + (sourceCenterY - targetCenterY) + "px) scale(" + (sourceRect.width / targetRect.width) + ", " + (sourceRect.height / targetRect.height) + ")",
            opacity: 0.72
          },
          { transform: "translate(0, 0) scale(1, 1)", opacity: 1 }
        ], {
          duration: 360,
          easing: "cubic-bezier(.2,.75,.25,1)"
        });
      }
      closeButton.focus({ preventScroll: true });
    });

    preloadAdjacent();
  }

  function closeLightbox() {
    if (!overlay.classList.contains("photo-lightbox--open")) return;
    navigationToken += 1;

    const source = images[currentIndex] || lastTrigger;
    enlargedImage.getAnimations().forEach(function (animation) { animation.cancel(); });
    caption.getAnimations().forEach(function (animation) { animation.cancel(); });

    const startRect = enlargedImage.getBoundingClientRect();
    const sourceVisibility = source ? source.style.visibility : "";
    let returningImage = null;

    // The actual lightbox image is hidden before *anything* about the overlay
    // or page layout changes. It remains hidden after closing and is only
    // revealed by openLightbox(), so it cannot flash at full size on teardown.
    enlargedImage.style.visibility = "hidden";
    if (source) source.style.visibility = "hidden";

    // Create a completely independent fixed-position copy for the return trip.
    // Its geometry is animated directly (left/top/width/height), rather than by
    // a transform whose fill state can snap back for a frame when it finishes.
    if (!reducedMotion.matches && source && startRect.width && startRect.height) {
      const computedImageStyle = window.getComputedStyle(enlargedImage);
      returningImage = enlargedImage.cloneNode(false);
      returningImage.removeAttribute("id");
      returningImage.removeAttribute("class");
      returningImage.removeAttribute("tabindex");
      returningImage.setAttribute("aria-hidden", "true");
      returningImage.alt = "";
      returningImage.style.position = "fixed";
      returningImage.style.left = startRect.left + "px";
      returningImage.style.top = startRect.top + "px";
      returningImage.style.width = startRect.width + "px";
      returningImage.style.height = startRect.height + "px";
      returningImage.style.maxWidth = "none";
      returningImage.style.maxHeight = "none";
      returningImage.style.margin = "0";
      returningImage.style.padding = "0";
      returningImage.style.border = computedImageStyle.border;
      returningImage.style.borderRadius = computedImageStyle.borderRadius;
      returningImage.style.boxShadow = computedImageStyle.boxShadow;
      returningImage.style.objectFit = "fill";
      returningImage.style.pointerEvents = "none";
      returningImage.style.zIndex = "1201";
      returningImage.style.opacity = "1";
      // cloneNode() copies the inline visibility:hidden set on enlargedImage
      // above. Make only the independent flying copy visible; the real
      // lightbox image stays hidden throughout teardown, preventing flashes.
      returningImage.style.visibility = "visible";
      document.body.appendChild(returningImage);
    }

    // Restore the normal page layout before measuring the destination. Because
    // the flying copy is position:fixed, scrollbar restoration cannot move it.
    document.body.style.overflow = savedBodyOverflow;
    document.body.style.paddingRight = savedBodyPaddingRight;
    const sourceRect = source ? getSourceRect(source) : null;

    overlay.classList.add("photo-lightbox--closing");
    overlay.classList.remove("photo-lightbox--open");
    overlay.setAttribute("aria-hidden", "true");

    function finishClose() {
      // Remove the lightbox from rendering altogether while its real enlarged
      // image is still hidden. This is stronger than relying on opacity or a
      // delayed visibility transition and prevents any full-size teardown frame.
      overlay.hidden = true;
      overlay.classList.remove("photo-lightbox--closing");

      if (source) source.style.visibility = sourceVisibility;
      if (lastTrigger) lastTrigger.focus({ preventScroll: true });

      if (returningImage) {
        // Keep the landed copy for one paint so the now-visible thumbnail is
        // definitely underneath it before the copy disappears. There is no
        // blank frame and no handoff back to the full-size lightbox image.
        requestAnimationFrame(function () {
          returningImage.remove();
        });
      }
    }

    if (returningImage && sourceRect && sourceRect.width && sourceRect.height) {
      const endLeft = sourceRect.left;
      const endTop = sourceRect.top;
      const endWidth = sourceRect.width;
      const endHeight = sourceRect.height;

      const closingAnimation = returningImage.animate([
        {
          left: startRect.left + "px",
          top: startRect.top + "px",
          width: startRect.width + "px",
          height: startRect.height + "px",
          opacity: 1
        },
        {
          left: endLeft + "px",
          top: endTop + "px",
          width: endWidth + "px",
          height: endHeight + "px",
          opacity: 1
        }
      ], {
        duration: 360,
        easing: "cubic-bezier(.2,.75,.25,1)",
        fill: "forwards"
      });

      function landAndFinish() {
        // Freeze the final geometry as ordinary inline style *before* cancelling
        // the Web Animation. Therefore the element cannot snap back to full size
        // even for a single compositor frame when the animation object ends.
        returningImage.style.left = endLeft + "px";
        returningImage.style.top = endTop + "px";
        returningImage.style.width = endWidth + "px";
        returningImage.style.height = endHeight + "px";
        returningImage.style.opacity = "1";
        closingAnimation.cancel();
        finishClose();
      }

      closingAnimation.finished.then(landAndFinish).catch(function () {
        // If the animation is cancelled externally, still close without ever
        // revealing the hidden full-size image.
        if (returningImage && returningImage.isConnected) {
          returningImage.style.left = endLeft + "px";
          returningImage.style.top = endTop + "px";
          returningImage.style.width = endWidth + "px";
          returningImage.style.height = endHeight + "px";
        }
        finishClose();
      });
    } else {
      finishClose();
    }
  }

  function showAdjacent(direction) {
    if (!isGallery) return;
    const nextIndex = (currentIndex + direction + images.length) % images.length;
    const token = ++navigationToken;
    const source = images[nextIndex];
    const nextSource = source.currentSrc || source.src;
    const loader = new Image();
    loader.src = nextSource;

    const ready = typeof loader.decode === "function"
      ? loader.decode().catch(function () {})
      : new Promise(function (resolve) {
          if (loader.complete) resolve();
          else {
            loader.addEventListener("load", resolve, { once: true });
            loader.addEventListener("error", resolve, { once: true });
          }
        });

    ready.then(function () {
      if (token !== navigationToken || !overlay.classList.contains("photo-lightbox--open")) return;
      const outgoing = reducedMotion.matches ? null : enlargedImage.animate([
        { opacity: 1, transform: "translateX(0)" },
        { opacity: 0, transform: "translateX(" + (-direction * 26) + "px)" }
      ], { duration: 130, easing: "ease-in" });

      const swap = function () {
        if (token !== navigationToken || !overlay.classList.contains("photo-lightbox--open")) return;
        currentIndex = nextIndex;
        setLightboxContent(currentIndex);
        if (!reducedMotion.matches) {
          enlargedImage.animate([
            { opacity: 0, transform: "translateX(" + (direction * 26) + "px)" },
            { opacity: 1, transform: "translateX(0)" }
          ], { duration: 190, easing: "ease-out" });
          caption.animate([
            { opacity: 0 },
            { opacity: 1 }
          ], { duration: 190, easing: "ease-out" });
        }
        preloadAdjacent();
      };

      if (outgoing) outgoing.finished.then(swap).catch(swap);
      else swap();
    });
  }

  function preloadAdjacent() {
    if (!isGallery) return;
    [-1, 1].forEach(function (offset) {
      const index = (currentIndex + offset + images.length) % images.length;
      const preload = new Image();
      preload.src = images[index].currentSrc || images[index].src;
    });
  }
}
