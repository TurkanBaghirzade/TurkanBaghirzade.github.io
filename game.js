const stage = document.querySelector(".game-stage");
const player = document.querySelector("[data-player]");

if (stage && player) {
  const liveMessage = document.querySelector(".stage-live");
  const keyDirections = new Map([
    ["ArrowLeft", [-1, 0]], ["a", [-1, 0]], ["A", [-1, 0]],
    ["ArrowRight", [1, 0]], ["d", [1, 0]], ["D", [1, 0]],
    ["ArrowUp", [0, -1]], ["w", [0, -1]], ["W", [0, -1]],
    ["ArrowDown", [0, 1]], ["s", [0, 1]], ["S", [0, 1]],
  ]);
  const keysDown = new Set();
  const data = window.PORTFOLIO_DATA || {};
  const transitionLayer = document.createElement("div");
  transitionLayer.className = "stage-transition";
  transitionLayer.setAttribute("aria-hidden", "true");
  document.body.append(transitionLayer);

  let interior = false;
  let busy = false;
  let openingGate = false;
  let pointerId = null;
  let frame = 0;
  let lastFrame = 0;
  let playerX = stage.clientWidth * 0.16;
  let playerY = stage.clientHeight * 0.86;
  let route = [];
  let routeIndex = 0;
  let arrivalAction = null;
  let lastNearbyId = "";

  const gate = stage.querySelector(".portal-door") || document.createElement("button");
  if (!gate.isConnected) {
    gate.type = "button";
    gate.className = "portal-door world-gate";
    gate.setAttribute("aria-label", "Open the glowing door and enter the interior");
    gate.innerHTML = '<span class="portal-ring" aria-hidden="true"></span><span class="gate-leaf gate-leaf-left" aria-hidden="true"></span><span class="gate-leaf gate-leaf-right" aria-hidden="true"></span><span class="portal-label">ENTER THE PALACE <span aria-hidden="true">✦</span></span>';
    stage.append(gate);
  } else if (!gate.querySelector(".gate-leaf")) {
    gate.insertAdjacentHTML("afterbegin", '<span class="gate-leaf gate-leaf-left" aria-hidden="true"></span><span class="gate-leaf gate-leaf-right" aria-hidden="true"></span>');
  }

  const interiorScene = document.createElement("div");
  interiorScene.className = "interior-scene";
  interiorScene.setAttribute("aria-label", "The palace library and learning room");
  interiorScene.innerHTML = '<div class="interior-shade" aria-hidden="true"></div><div class="interior-nameplate"><span>THE STARLIGHT LIBRARY</span><small>Walk the tiled floor · Click a glow to explore</small></div><div class="interior-floor" aria-hidden="true"></div><div class="scene-objects"></div><p class="interaction-hint" aria-live="polite"></p>';
  stage.append(interiorScene);

  const objectLayer = interiorScene.querySelector(".scene-objects");
  const gameObjects = data.gameObjects || [];
  const exitObject = { id: "exit", icon: "🚪", label: "Back outside", title: "Return to the courtyard", x: 0.12, y: 0.74, walkX: 0.16, walkY: 0.8 };
  const interiorObjects = [...gameObjects.map((object) => ({ ...object, walkX: object.walkX || object.x, walkY: object.walkY || object.y })), exitObject];

  interiorObjects.forEach((object) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `scene-object scene-object-${object.id}`;
    button.dataset.object = object.id;
    button.style.left = `${object.x * 100}%`;
    button.style.top = `${object.y * 100}%`;
    button.setAttribute("aria-label", object.label);
    button.innerHTML = `<span class="object-glow" aria-hidden="true"></span><span class="object-icon" aria-hidden="true">${object.icon}</span><span class="object-label">${object.label}</span>`;
    objectLayer.append(button);
  });

  const modal = document.createElement("div");
  modal.className = "game-card-overlay";
  modal.hidden = true;
  modal.innerHTML = '<section class="game-info-card" role="dialog" aria-modal="true" aria-labelledby="game-card-title"><button class="game-card-close" type="button" aria-label="Close card">×</button><img class="game-card-image" alt=""><div class="game-card-copy"><p class="game-card-eyebrow">A PAGE FROM MY JOURNEY</p><h2 id="game-card-title"></h2><p class="game-card-body"></p></div></section>';
  stage.append(modal);
  const cardImage = modal.querySelector(".game-card-image");
  const cardTitle = modal.querySelector("#game-card-title");
  const cardBody = modal.querySelector(".game-card-body");
  const closeButton = modal.querySelector(".game-card-close");
  const interactionHint = interiorScene.querySelector(".interaction-hint");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const speed = 250;

  function dimensions() {
    return { width: stage.clientWidth, height: stage.clientHeight };
  }

  function renderPlayer() {
    const { width, height } = dimensions();
    const half = player.offsetWidth / 2;
    playerX = Math.max(half, Math.min(width - half, playerX));
    playerY = Math.max(player.offsetHeight * 0.56, Math.min(height - 15, playerY));
    player.style.left = `${playerX - half}px`;
    player.style.top = `${playerY - player.offsetHeight}px`;
    player.style.bottom = "auto";
    player.style.transform = "none";
  }

  function isWalkable(x, y) {
    if (x < 0.025 || x > 0.975) return false;
    if (!interior) return y >= 0.56 && y <= 0.94;
    if (y < 0.75 || y > 0.965) return false;
    const depth = (y - 0.75) / 0.215;
    const left = 0.19 - depth * 0.16;
    const right = 0.81 + depth * 0.16;
    if (x < left || x > right) return false;
    // Keep the fairy in front of the desk and away from its legs.
    if (x > 0.30 && x < 0.69 && y > 0.79 && y < 0.875) return false;
    return true;
  }

  function nearestWalkable(x, y) {
    if (isWalkable(x, y)) return { x, y };
    for (let radius = 1; radius <= 18; radius += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        for (const dy of [-radius, radius]) {
          const px = x + dx * 0.012;
          const py = y + dy * 0.012;
          if (isWalkable(px, py)) return { x: px, y: py };
        }
      }
      for (let dy = -radius + 1; dy < radius; dy += 1) {
        for (const dx of [-radius, radius]) {
          const px = x + dx * 0.012;
          const py = y + dy * 0.012;
          if (isWalkable(px, py)) return { x: px, y: py };
        }
      }
    }
    return { x: interior ? 0.16 : 0.5, y: interior ? 0.91 : 0.86 };
  }

  function findPath(startX, startY, endX, endY) {
    const cols = 52;
    const rows = 18;
    const pointAt = (x, y) => ({ x: (x + 0.5) / cols, y: interior ? 0.75 + ((y + 0.5) / rows) * 0.215 : 0.56 + ((y + 0.5) / rows) * 0.38 });
    const cellAt = (x, y) => ({
      x: Math.max(0, Math.min(cols - 1, Math.floor(x * cols))),
      y: Math.max(0, Math.min(rows - 1, Math.floor(((y - (interior ? 0.75 : 0.56)) / (interior ? 0.215 : 0.38)) * rows))),
    });
    const start = cellAt(startX, startY);
    const end = cellAt(endX, endY);
    const key = (x, y) => `${x},${y}`;
    const queue = [{ ...start }];
    const cameFrom = new Map([[key(start.x, start.y), null]]);
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];

    while (queue.length) {
      const current = queue.shift();
      if (current.x === end.x && current.y === end.y) break;
      for (const [dx, dy] of directions) {
        const nx = current.x + dx;
        const ny = current.y + dy;
        const keyNext = key(nx, ny);
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows || cameFrom.has(keyNext)) continue;
        const point = pointAt(nx, ny);
        if (!isWalkable(point.x, point.y)) continue;
        if (dx && dy && (!isWalkable(pointAt(current.x + dx, current.y).x, pointAt(current.x + dx, current.y).y) || !isWalkable(pointAt(current.x, current.y + dy).x, pointAt(current.x, current.y + dy).y))) continue;
        cameFrom.set(keyNext, key(current.x, current.y));
        queue.push({ x: nx, y: ny });
      }
    }

    const endKey = key(end.x, end.y);
    if (!cameFrom.has(endKey)) return [nearestWalkable(endX, endY)];
    const cells = [];
    let cursor = endKey;
    while (cursor) {
      const [x, y] = cursor.split(",").map(Number);
      cells.push({ x, y });
      cursor = cameFrom.get(cursor);
    }
    cells.reverse();
    const waypoints = [];
    for (let i = 1; i < cells.length; i += 1) {
      const previous = cells[i - 1];
      const current = cells[i];
      const before = cells[i - 2] || previous;
      const after = cells[i + 1] || current;
      if ((current.x - previous.x) !== (after.x - current.x) || (current.y - previous.y) !== (after.y - current.y)) waypoints.push(pointAt(previous.x, previous.y));
    }
    waypoints.push(nearestWalkable(endX, endY));
    return waypoints;
  }

  function findObject(id) {
    return interiorObjects.find((object) => object.id === id);
  }

  function openCard(object) {
    if (!object || object.id === "exit") return;
    busy = true;
    keysDown.clear();
    route = [];
    arrivalAction = null;
    player.classList.remove("is-moving");
    cardTitle.textContent = object.title;
    cardBody.textContent = object.body;
    cardImage.src = object.image;
    cardImage.alt = object.alt;
    modal.hidden = false;
    closeButton.focus();
    if (liveMessage) liveMessage.textContent = `${object.title} opened.`;
  }

  function closeCard() {
    if (modal.hidden) return;
    modal.hidden = true;
    busy = false;
    lastNearbyId = nearObject()?.id || "";
    if (liveMessage) liveMessage.textContent = "Back to exploring.";
  }

  function nearObject() {
    if (!interior) return null;
    const { width, height } = dimensions();
    return interiorObjects.find((object) => {
      const dx = playerX - object.walkX * width;
      const dy = playerY - object.walkY * height;
      return Math.hypot(dx, dy) < (object.id === "exit" ? 80 : 66);
    }) || null;
  }

  function updateHint() {
    if (interior) {
      const near = nearObject();
      interactionHint.textContent = near ? `Press E or click: ${near.label}` : "Click a glowing object · Press E nearby · Use WASD or arrows";
      if (near && near.id !== "exit" && near.id !== lastNearbyId && !busy) {
        lastNearbyId = near.id;
        openCard(near);
      } else if (!near) {
        lastNearbyId = "";
      }
      return;
    }
    if (gate && Math.hypot(playerX - stage.clientWidth * 0.51, playerY - stage.clientHeight * 0.64) < 135) {
      stage.dataset.actionHint = "Press E to enter · Scroll down to open the gate";
    } else {
      stage.dataset.actionHint = "Click or drag to walk · Find the glowing gate";
    }
  }

  function moveTo(x, y, action = null) {
    if (busy) return;
    const target = nearestWalkable(x, y);
    const { width, height } = dimensions();
    const start = { x: playerX / width, y: playerY / height };
    route = interior ? findPath(start.x, start.y, target.x, target.y) : [target];
    routeIndex = 0;
    arrivalAction = action;
    player.classList.add("is-moving");
    player.classList.toggle("faces-left", target.x * width < playerX);
    ensureFrame();
  }

  function activateObject(object) {
    if (!object) return;
    if (object.id === "exit") {
      const exitButton = objectLayer.querySelector('[data-object="exit"]');
      moveTo(object.walkX, object.walkY, () => {
        exitButton?.classList.add("is-opening");
        leaveInterior();
      });
      return;
    }
    moveTo(object.walkX, object.walkY, () => openCard(object));
  }

  function nearestObjectForKey() {
    if (!interior) {
      const nearGate = Math.hypot(playerX - stage.clientWidth * 0.51, playerY - stage.clientHeight * 0.64) < 150;
      return nearGate ? { id: "gate" } : null;
    }
    return nearObject();
  }

  function ensureFrame() {
    if (!frame) frame = window.requestAnimationFrame(tick);
  }

  function stopMotion() {
    route = [];
    arrivalAction = null;
    player.classList.remove("is-moving");
  }

  function toggleScene(nextInterior) {
    const change = () => {
      interior = nextInterior;
      route = [];
      keysDown.clear();
      stage.classList.toggle("is-interior", interior);
      stage.classList.toggle("is-exterior", !interior);
      interiorScene.setAttribute("aria-hidden", String(!interior));
      if (gate) gate.setAttribute("aria-hidden", String(interior));
      const { width, height } = dimensions();
      if (interior) {
        playerX = width * 0.5;
        playerY = height * 0.92;
        if (liveMessage) liveMessage.textContent = "You entered the Starlight Library.";
      } else {
        playerX = width * 0.5;
        playerY = height * 0.86;
        gate?.classList.remove("is-opening");
        if (liveMessage) liveMessage.textContent = "You returned to the courtyard.";
      }
      renderPlayer();
      updateHint();
    };
    transitionLayer.classList.add("is-active");
    window.setTimeout(() => {
      change();
      window.setTimeout(() => transitionLayer.classList.remove("is-active"), reducedMotion.matches ? 0 : 60);
    }, reducedMotion.matches ? 0 : 420);
  }

  function enterInterior() {
    if (busy || openingGate || interior) return;
    openingGate = true;
    keysDown.clear();
    gate?.classList.add("is-opening");
    moveTo(0.51, 0.76, () => {
      busy = true;
      window.setTimeout(() => {
        toggleScene(true);
        openingGate = false;
        busy = false;
      }, reducedMotion.matches ? 0 : 360);
    });
  }

  function leaveInterior() {
    if (busy || !interior) return;
    busy = true;
    keysDown.clear();
    stage.classList.add("is-exiting");
    window.setTimeout(() => {
      toggleScene(false);
      stage.classList.remove("is-exiting");
      busy = false;
    }, reducedMotion.matches ? 80 : 260);
  }

  function tick(timestamp) {
    frame = 0;
    const dt = Math.min(0.04, Math.max(0, (timestamp - (lastFrame || timestamp)) / 1000));
    lastFrame = timestamp;
    const { width, height } = dimensions();
    let nextX = playerX;
    let nextY = playerY;
    const direction = [...keysDown].reduce((sum, key) => [sum[0] + keyDirections.get(key)[0], sum[1] + keyDirections.get(key)[1]], [0, 0]);

    if (direction[0] || direction[1]) {
      const magnitude = Math.hypot(...direction) || 1;
      nextX += (direction[0] / magnitude) * speed * dt;
      nextY += (direction[1] / magnitude) * speed * dt;
      const normalizedX = nextX / width;
      const normalizedY = nextY / height;
      if (isWalkable(normalizedX, normalizedY)) {
        playerX = nextX;
        playerY = nextY;
      } else if (isWalkable(normalizedX, playerY / height)) {
        playerX = nextX;
      } else if (isWalkable(playerX / width, normalizedY)) {
        playerY = nextY;
      }
      route = [];
      player.classList.toggle("faces-left", direction[0] < 0);
    } else if (route.length) {
      const target = route[routeIndex];
      const dx = target.x * width - playerX;
      const dy = target.y * height - playerY;
      const distance = Math.hypot(dx, dy);
      const step = speed * dt;
      if (distance <= step + 1) {
        playerX = target.x * width;
        playerY = target.y * height;
        routeIndex += 1;
        if (routeIndex >= route.length) {
          route = [];
          player.classList.remove("is-moving");
          const action = arrivalAction;
          arrivalAction = null;
          if (action) action();
        }
      } else {
        playerX += (dx / distance) * step;
        playerY += (dy / distance) * step;
        player.classList.toggle("faces-left", dx < 0);
      }
    }

    renderPlayer();
    updateHint();
    if (keysDown.size || route.length) ensureFrame();
    else lastFrame = 0;
  }

  gate.addEventListener("click", (event) => {
    event.preventDefault();
    enterInterior();
  });
  interiorScene.addEventListener("click", (event) => {
    const button = event.target.closest("[data-object]");
    if (!button || busy) return;
    activateObject(findObject(button.dataset.object));
  });
  stage.addEventListener("click", (event) => {
    const oldPortal = event.target.closest(".portal-door");
    if (oldPortal && oldPortal !== gate) {
      event.preventDefault();
      enterInterior();
    }
  });

  stage.addEventListener("pointerdown", (event) => {
    if (event.target.closest("a, button, .game-card-overlay")) return;
    pointerId = event.pointerId;
    stage.setPointerCapture(pointerId);
    const rect = stage.getBoundingClientRect();
    moveTo((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
  });
  stage.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointerId) return;
    const rect = stage.getBoundingClientRect();
    moveTo((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
  });
  const releasePointer = (event) => { if (event.pointerId === pointerId) pointerId = null; };
  stage.addEventListener("pointerup", releasePointer);
  stage.addEventListener("pointercancel", releasePointer);

  document.querySelectorAll("[data-game-link]").forEach((link) => {
    if (link.classList.contains("portal-door")) return;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      if (busy) return;
      busy = true;
      transitionLayer.classList.add("is-active");
      window.setTimeout(() => window.location.assign(link.href), reducedMotion.matches ? 0 : 440);
    });
  });

  document.querySelectorAll("[data-move]").forEach((button) => {
    const directionName = button.dataset.move;
    const direction = directionName === "left" ? "ArrowLeft" : "ArrowRight";
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      button.classList.add("is-active");
      keysDown.add(direction);
      ensureFrame();
    });
    const release = () => { keysDown.delete(direction); button.classList.remove("is-active"); };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  });

  window.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    if (event.key === "Escape") { closeCard(); return; }
    if (modal.hidden && (event.key === "e" || event.key === "E")) {
      const target = nearestObjectForKey();
      if (!target) return;
      event.preventDefault();
      if (target.id === "gate") enterInterior();
      else activateObject(target);
      return;
    }
    const direction = keyDirections.get(event.key);
    if (!direction || !modal.hidden || busy || openingGate) return;
    event.preventDefault();
    keysDown.add(event.key);
    player.classList.add("is-moving");
    ensureFrame();
  });
  window.addEventListener("keyup", (event) => {
    keysDown.delete(event.key);
    if (!keysDown.size && !route.length) player.classList.remove("is-moving");
  });
  window.addEventListener("blur", () => { keysDown.clear(); player.classList.remove("is-moving"); });
  stage.addEventListener("wheel", (event) => {
    event.preventDefault();
    if (event.deltaY > 0 && !interior) enterInterior();
    else if (event.deltaY < 0 && interior) leaveInterior();
    else if (interior && event.deltaY > 0) {
      const target = nearObject();
      if (target) activateObject(target);
    }
  }, { passive: false });

  closeButton.addEventListener("click", closeCard);
  modal.addEventListener("click", (event) => { if (event.target === modal) closeCard(); });
  window.addEventListener("resize", () => {
    const { width, height } = dimensions();
    playerX = Math.min(playerX, width - player.offsetWidth / 2);
    playerY = Math.min(playerY, height - 15);
    renderPlayer();
  });

  if (liveMessage) liveMessage.textContent = "Click or drag across the ground to walk. Find the glowing door to explore inside.";
  stage.dataset.actionHint = "Click or drag to walk · Find the glowing gate";
  stage.classList.add("is-exterior");
  interiorScene.setAttribute("aria-hidden", "true");
  renderPlayer();
  updateHint();
}

if (new URLSearchParams(window.location.search).get("classic") === "1") {
  document.body.classList.add("classic-view");
}
