const stage = document.querySelector(".game-stage");
const player = document.querySelector("[data-player]");

if (stage && player) {
  const keysDown = new Set();
  const moveButtons = document.querySelectorAll("[data-move]");
  const stageLinks = document.querySelectorAll("[data-game-link]");
  const liveMessage = document.querySelector(".stage-live");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const transitionLayer = document.createElement("div");
  transitionLayer.className = "stage-transition";
  transitionLayer.setAttribute("aria-hidden", "true");
  document.body.append(transitionLayer);

  let playerX = 0;
  let animationFrame = 0;
  let movementTimer = 0;
  let isTransitioning = false;
  let lastTrailTime = 0;

  function renderPlayer() {
    const maxX = Math.max(0, stage.clientWidth - player.offsetWidth);
    playerX = Math.min(Math.max(0, playerX), maxX);
    player.style.transform = `translate3d(${playerX}px, 0, 0)`;

    if (playerX >= maxX - 2 && maxX > 0) {
      transitionTo(document.body.dataset.next);
      return;
    }

    if (keysDown.size > 0) {
      player.classList.add("is-moving");
    } else {
      player.classList.remove("is-moving");
    }
  }

  function movePlayer() {
    if (isTransitioning || keysDown.size === 0) return;
    const direction = keysDown.has("right") ? 1 : keysDown.has("left") ? -1 : 0;
    playerX += direction * 4.5;
    player.classList.toggle("faces-left", direction < 0);
    renderPlayer();
  }

  function animatePlayer() {
    animationFrame = 0;
    if (isTransitioning || keysDown.size === 0) return;
    movePlayer();

    if (!isTransitioning) animationFrame = window.requestAnimationFrame(animatePlayer);
  }

  function startMoving(direction) {
    const isNewDirection = !keysDown.has(direction);
    keysDown.add(direction);
    player.classList.toggle("faces-left", direction === "left");
    if (isNewDirection) playerX += direction === "right" ? 14 : -14;
    if (isNewDirection) liveMessage.textContent = `Moving ${direction}.`;
    renderPlayer();

    if (animationFrame || movementTimer || isTransitioning) return;

    if (!animationFrame && !movementTimer && !isTransitioning) {
      if (document.hidden) {
        movementTimer = window.setInterval(movePlayer, 16);
      } else {
        animationFrame = window.requestAnimationFrame(animatePlayer);
      }
    }
  }

  function stopMoving(direction) {
    keysDown.delete(direction);
    if (keysDown.size === 0) {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      if (movementTimer) window.clearInterval(movementTimer);
      animationFrame = 0;
      movementTimer = 0;
      player.classList.remove("is-moving");
    }
  }

  function transitionTo(destination, trigger) {
    if (isTransitioning || !destination) return;
    isTransitioning = true;
    keysDown.clear();
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    if (movementTimer) window.clearInterval(movementTimer);
    animationFrame = 0;
    movementTimer = 0;
    if (trigger) trigger.classList.add("is-opening");
    stage.classList.add("is-leaving");
    liveMessage.textContent = "The next world is opening.";
    transitionLayer.classList.add("is-active");
    const delay = reducedMotion.matches ? 50 : 430;
    window.setTimeout(() => window.location.assign(destination), delay);
  }

  function createMagic(event) {
    const now = performance.now();
    if (now - lastTrailTime < 55 || isTransitioning) return;
    lastTrailTime = now;
    const sparkle = document.createElement("span");
    sparkle.className = "magic-trail";
    sparkle.setAttribute("aria-hidden", "true");
    sparkle.textContent = Math.random() > 0.5 ? "✦" : "✧";
    sparkle.style.left = `${event.clientX}px`;
    sparkle.style.top = `${event.clientY}px`;
    sparkle.style.fontSize = `${10 + Math.random() * 9}px`;
    document.body.append(sparkle);
    window.setTimeout(() => sparkle.remove(), 750);
  }

  const keyDirections = new Map([
    ["ArrowLeft", "left"],
    ["a", "left"],
    ["A", "left"],
    ["ArrowRight", "right"],
    ["d", "right"],
    ["D", "right"],
  ]);

  window.addEventListener("keydown", (event) => {
    const direction = keyDirections.get(event.key);
    if (!direction || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    event.preventDefault();
    startMoving(direction);
  });

  window.addEventListener("keyup", (event) => {
    const direction = keyDirections.get(event.key);
    if (direction) stopMoving(direction);
  });

  window.addEventListener("blur", () => {
    keysDown.clear();
    player.classList.remove("is-moving");
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    if (movementTimer) window.clearInterval(movementTimer);
    animationFrame = 0;
    movementTimer = 0;
  });

  moveButtons.forEach((button) => {
    const direction = button.dataset.move;
    button.addEventListener("click", (event) => {
      if (event.detail !== 0 || isTransitioning) return;
      playerX += direction === "right" ? 14 : -14;
      player.classList.toggle("faces-left", direction === "left");
      renderPlayer();
    });
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      button.classList.add("is-active");
      startMoving(direction);
    });
    const release = () => {
      button.classList.remove("is-active");
      stopMoving(direction);
    };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  });

  stageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      transitionTo(link.getAttribute("href"), link.classList.contains("portal-door") ? link : null);
    });
  });

  document.addEventListener("pointermove", createMagic);
  window.addEventListener("resize", renderPlayer);
  renderPlayer();
}
