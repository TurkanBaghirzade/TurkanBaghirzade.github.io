const stage = document.querySelector(".game-stage");
const player = document.querySelector("[data-player]");

if (stage && player) {
  const data = window.PORTFOLIO_DATA || {};
  const copy = data.worlds || {};
  const liveMessage = document.querySelector(".stage-live");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fade = document.createElement("div");
  fade.className = "stage-transition";
  fade.setAttribute("aria-hidden", "true");
  document.body.append(fade);

  const gate = document.createElement("button");
  gate.type = "button";
  gate.className = "portal-door world-gate";
  gate.setAttribute("aria-label", copy.homeDoor || "Enter the Castle World");
  gate.innerHTML = `<span class="portal-ring" aria-hidden="true"></span><span class="gate-leaf gate-leaf-left" aria-hidden="true"></span><span class="gate-leaf gate-leaf-right" aria-hidden="true"></span><span class="portal-label">${copy.homeDoor || "ENTER THE CASTLE WORLD"} <span aria-hidden="true">✦</span></span>`;
  stage.append(gate);

  const hudTitle = document.querySelector(".hud-title");
  const worldBadge = document.querySelector(".world-badge");
  const hudProgress = document.querySelector(".hud-progress");
  const kicker = document.querySelector(".stage-kicker");
  const heading = document.querySelector("#stage-title");
  const intro = document.querySelector(".stage-copy > p:not(.stage-kicker)");
  const stageLink = document.querySelector(".stage-link");
  const edgeLink = document.querySelector(".edge-hint");
  const sceneNav = document.createElement("nav");
  sceneNav.className = "scene-nav";
  sceneNav.setAttribute("aria-label", "Game scenes");
  const navItems = data.sceneNavigation?.items || [
    { id: "home", label: "Home" }, { id: "university", label: "University Library" },
    { id: "school", label: "School Library" }, { id: "skills", label: "Skills" },
  ];
  const visitedScenes = new Set(["home"]);
  sceneNav.innerHTML = `<div class="scene-nav-items">${navItems.map((item) => `<button type="button" class="scene-nav-item" data-scene="${item.id}">${item.label}</button>`).join("")}</div><span class="scene-visit-count" aria-live="polite"></span>`;
  stage.append(sceneNav);
  if (hudTitle && copy.homeTitle) hudTitle.textContent = copy.homeTitle;
  if (intro && copy.homeIntro) intro.textContent = copy.homeIntro;
  if (stageLink) stageLink.hidden = true;
  if (edgeLink) edgeLink.hidden = true;
  stage.style.setProperty("--stage-image", 'url("picture/home.jpeg")');

  const controls = new Set();
  const keyDirections = new Map([
    ["ArrowLeft", [-1, 0]], ["a", [-1, 0]], ["A", [-1, 0]],
    ["ArrowRight", [1, 0]], ["d", [1, 0]], ["D", [1, 0]],
    ["ArrowUp", [0, -1]], ["w", [0, -1]], ["W", [0, -1]],
    ["ArrowDown", [0, 1]], ["s", [0, 1]], ["S", [0, 1]],
  ]);
  let x = stage.clientWidth * 0.18;
  let y = stage.clientHeight * 0.84;
  let targetX = x;
  let targetY = y;
  let walking = false;
  let entering = false;
  let transitioning = false;
  let castleWorld = false;
  let pointerId = null;
  let animationFrame = 0;
  let previousFrame = 0;
  let currentLibrary = null;
  let castleHotspots = null;
  let libraryLayer = null;
  let cardOverlay = null;
  let lastNearbyId = "";
  let arrivalAction = null;
  const magicBagKey = "turkan-magic-bag-v1";
  let unlockedSkills = readMagicBag();
  let magicBagPanel = null;

  function walkBottom() {
    return stage.clientHeight - (sceneNav?.offsetHeight || 0) - 18;
  }

  function markSceneVisited(id) {
    visitedScenes.add(id);
    const activeScene = id === "castle" ? "home" : id;
    const count = sceneNav.querySelector(".scene-visit-count");
    count.textContent = `${data.sceneNavigation?.progressLabel || "Scenes visited"} ${visitedScenes.size}/5`;
    sceneNav.querySelectorAll(".scene-nav-item").forEach((button) => {
      const active = button.dataset.scene === activeScene;
      button.classList.toggle("is-current", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  }

  function syncSceneNav() {
    const id = currentLibrary || "home";
    sceneNav.querySelectorAll(".scene-nav-item").forEach((button) => {
      const active = button.dataset.scene === id;
      button.classList.toggle("is-current", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  }

  function readMagicBag() {
    try {
      const saved = JSON.parse(localStorage.getItem("turkan-magic-bag-v1") || "[]");
      const validIds = new Set((window.PORTFOLIO_DATA?.skillsScene?.items || []).map((item) => item.id));
      return Array.isArray(saved) ? [...new Set(saved.filter((id) => validIds.has(id)))] : [];
    } catch {
      return [];
    }
  }

  function updateMagicBag() {
    if (!magicBagPanel) return;
    const skillItems = data.skillsScene.items;
    const unlocked = skillItems.filter((item) => unlockedSkills.includes(item.id));
    magicBagPanel.querySelector(".magic-bag-count").textContent = `${unlocked.length}/${skillItems.length}`;
    const list = magicBagPanel.querySelector(".magic-bag-list");
    list.replaceChildren();
    if (!unlocked.length) {
      const empty = document.createElement("li");
      empty.className = "magic-bag-empty";
      empty.textContent = data.skillsScene.magicBag.empty;
      list.append(empty);
      return;
    }
    unlocked.forEach((item) => {
      const badge = document.createElement("li");
      badge.className = "magic-bag-item";
      badge.textContent = `${item.icon} ${item.label}`;
      list.append(badge);
    });
  }

  function unlockSkill(item) {
    if (currentLibrary !== "skills" || unlockedSkills.includes(item.id)) return;
    unlockedSkills.push(item.id);
    try { localStorage.setItem(magicBagKey, JSON.stringify(unlockedSkills)); } catch { /* Keep this session's unlocks. */ }
    updateMagicBag();
  }

  function sceneDefinition(id = currentLibrary) {
    return id === "skills" ? data.skillsScene : (data.libraries || {})[id];
  }

  function renderPlayer() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    x = Math.max(player.offsetWidth / 2, Math.min(width - player.offsetWidth / 2, x));
    y = Math.max(player.offsetHeight * 0.58, Math.min(walkBottom(), y));
    player.style.left = `${x - player.offsetWidth / 2}px`;
    player.style.top = `${y - player.offsetHeight}px`;
    player.style.bottom = "auto";
    player.style.transform = "none";
  }

  function requestWalk(px, py, action = null) {
    if (entering || transitioning || cardOverlay?.hidden === false) return;
    targetX = Math.max(stage.clientWidth * 0.04, Math.min(stage.clientWidth * 0.96, px));
    const floorTop = currentLibrary ? 0.73 : 0.56;
    targetY = Math.max(stage.clientHeight * floorTop, Math.min(walkBottom(), py));
    arrivalAction = action;
    walking = true;
    player.classList.add("is-moving");
    player.classList.toggle("faces-left", targetX < x);
    requestFrame();
  }

  function requestFrame() {
    if (!animationFrame) animationFrame = window.requestAnimationFrame(tick);
  }

  function enterCastle() {
    if (entering || transitioning || castleWorld) return;
    entering = true;
    controls.clear();
    gate.classList.add("is-opening");
    targetX = stage.clientWidth * 0.51;
    targetY = stage.clientHeight * 0.75;
    walking = true;
    player.classList.add("is-moving");
    player.classList.toggle("faces-left", targetX < x);
    if (liveMessage) liveMessage.textContent = "The gate opens. The fairy walks into the Castle World.";
    requestFrame();
  }

  function revealCastle() {
    transitioning = true;
    fade.classList.add("is-active");
    window.setTimeout(() => {
      stage.style.setProperty("--stage-image", 'url("picture/background.jpeg")');
      stage.classList.add("is-castle-world");
      castleWorld = true;
      markSceneVisited("castle");
      gate.remove();
      if (hudTitle) hudTitle.textContent = copy.castleTitle || "Castle World";
      if (worldBadge) worldBadge.textContent = "WORLD 02 ✦";
      if (hudProgress) hudProgress.textContent = "CASTLE WORLD · 02 / 05";
      if (kicker) kicker.textContent = copy.castleKicker || "A new world opens";
      if (heading) heading.innerHTML = copy.castleHeading || "Welcome to the<br><span>Castle World.</span>";
      if (intro) intro.textContent = copy.castleIntro || "The towers are waiting.";
      x = stage.clientWidth * 0.51;
      y = Math.min(stage.clientHeight * 0.84, walkBottom());
      targetX = x;
      targetY = y;
      walking = false;
      entering = false;
      transitioning = false;
      player.classList.remove("is-moving");
      stage.dataset.actionHint = "Choose a castle library or visit the Skills Garden";
      if (liveMessage) liveMessage.textContent = "You arrived in the Castle World.";
      renderPlayer();
      addCastleHotspots();
      syncSceneNav();
      window.setTimeout(() => fade.classList.remove("is-active"), reduceMotion.matches ? 0 : 70);
    }, reduceMotion.matches ? 0 : 450);
  }

  function makeSceneObject(object, className, parent) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.dataset.object = object.id;
    button.style.left = `${object.x * 100}%`;
    button.style.top = `${object.y * 100}%`;
    button.setAttribute("aria-label", object.label);
    button.innerHTML = `<span class="object-glow" aria-hidden="true"></span><span class="object-icon" aria-hidden="true">${object.icon}</span><span class="object-label">${object.label}</span>`;
    parent.append(button);
    return button;
  }

  function addCastleHotspots() {
    castleHotspots?.remove();
    castleHotspots = document.createElement("div");
    castleHotspots.className = "castle-hotspots";
    const castles = [
      { id: "school", icon: "🏰", label: "Holberton Castle · School Library", x: 0.27, y: 0.63 },
      { id: "university", icon: "🏰", label: "Ada University Castle · University Library", x: 0.75, y: 0.63 },
      { id: "skills", icon: "✨", label: "Skills Garden · Languages and hobbies", x: 0.51, y: 0.53 },
    ];
    castles.forEach((castle) => {
      const button = makeSceneObject(castle, "scene-object castle-object", castleHotspots);
      button.addEventListener("click", () => enterLibrary(castle.id, button));
    });
    stage.append(castleHotspots);
  }

  function enterLibrary(id, doorButton) {
    if (transitioning || currentLibrary) return;
    const library = sceneDefinition(id);
    if (!library) return;
    transitioning = true;
    doorButton.classList.add("is-opening");
    if (liveMessage) liveMessage.textContent = `Opening ${library.title}.`;
    fade.classList.add("is-active");
    window.setTimeout(() => {
      castleHotspots?.remove();
      currentLibrary = id;
      markSceneVisited(id);
      stage.classList.add("is-library");
      stage.style.setProperty("--stage-image", `url("${library.background}")`);
      if (hudTitle) hudTitle.textContent = library.title;
      if (worldBadge) worldBadge.textContent = id === "school" ? "HOLBERTON ✦" : id === "university" ? "ADA UNIVERSITY ✦" : "SKILLS GARDEN ✦";
      if (hudProgress) hudProgress.textContent = id === "school" ? "SCHOOL LIBRARY · 03 / 05" : id === "university" ? "UNIVERSITY LIBRARY · 04 / 05" : "SKILLS GARDEN · 05 / 05";
      if (kicker) kicker.textContent = library.subtitle;
      if (heading) heading.textContent = library.title;
      if (intro) intro.textContent = library.intro;
      x = stage.clientWidth * 0.5;
      y = Math.min(stage.clientHeight * 0.91, walkBottom());
      targetX = x;
      targetY = y;
      walking = false;
      arrivalAction = null;
      transitioning = false;
      player.classList.remove("is-moving");
      addLibraryScene(library);
      syncSceneNav();
      stage.dataset.actionHint = "Walk the library floor · Click a glowing book or shelf";
      if (liveMessage) liveMessage.textContent = `${library.title} opened.`;
      renderPlayer();
      window.setTimeout(() => fade.classList.remove("is-active"), reduceMotion.matches ? 0 : 70);
    }, reduceMotion.matches ? 0 : 450);
  }

  function addLibraryScene(library) {
    libraryLayer?.remove();
    libraryLayer = document.createElement("div");
    libraryLayer.className = "library-layer";
    libraryLayer.innerHTML = `<div class="library-nameplate"><strong>${library.title}</strong><small>${library.subtitle}</small></div><div class="library-hotspots"></div><p class="library-hint" aria-live="polite">${library.intro}</p>`;
    stage.append(libraryLayer);
    const hotspotLayer = libraryLayer.querySelector(".library-hotspots");
    library.items.forEach((item) => {
      const button = makeSceneObject(item, `scene-object library-object library-object-${item.id}`, hotspotLayer);
      button.addEventListener("click", () => walkToLibraryObject(item));
    });
    const exit = { id: "library-exit", icon: "🚪", label: "Return to Castle World", x: 0.09, y: 0.73, walkX: 0.15, walkY: 0.89 };
    const exitButton = makeSceneObject(exit, "scene-object scene-object-exit library-exit", hotspotLayer);
    exitButton.addEventListener("click", returnToCastle);
    if (currentLibrary === "skills") {
      magicBagPanel = document.createElement("aside");
      magicBagPanel.className = "magic-bag-panel";
      magicBagPanel.setAttribute("aria-label", "Collected skills and hobbies");
      magicBagPanel.innerHTML = `<div class="magic-bag-heading"><span>${data.skillsScene.magicBag.title}</span><strong class="magic-bag-count"></strong></div><ul class="magic-bag-list"></ul>`;
      libraryLayer.append(magicBagPanel);
      updateMagicBag();
    } else {
      magicBagPanel = null;
    }
    cardOverlay = document.createElement("div");
    cardOverlay.className = "library-card-overlay";
    cardOverlay.hidden = true;
    const card = document.createElement("section");
    card.className = "library-info-card";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");
    card.setAttribute("aria-labelledby", "library-card-title");
    card.innerHTML = '<button class="library-card-close" type="button" aria-label="Close card">×</button><div class="library-card-media"><img alt=""><p class="library-image-note" hidden></p></div><div class="library-card-content"><p class="library-card-eyebrow"></p><h2 id="library-card-title"></h2><dl class="library-card-fields"></dl><a class="library-card-link" hidden></a></div>';
    cardOverlay.append(card);
    stage.append(cardOverlay);
    cardOverlay.addEventListener("click", (event) => { if (event.target === cardOverlay) closeLibraryCard(); });
    card.querySelector(".library-card-close").addEventListener("click", closeLibraryCard);
  }

  function walkToLibraryObject(item) {
    if (transitioning || !currentLibrary || cardOverlay?.hidden === false) return;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    requestWalk(item.walkX * width, item.walkY * height, () => openLibraryCard(item));
  }

  function openLibraryCard(item) {
    if (!cardOverlay || cardOverlay.hidden === false) return;
    const library = sceneDefinition();
    const card = cardOverlay.querySelector(".library-info-card");
    const image = card.querySelector(".library-card-media img");
    const media = image.closest(".library-card-media");
    const note = card.querySelector(".library-image-note");
    const link = card.querySelector(".library-card-link");
    card.querySelector(".library-card-eyebrow").textContent = library.subtitle;
    card.querySelector("#library-card-title").textContent = item.title;
    image.hidden = !item.image;
    media.hidden = !item.image;
    image.src = item.image || "";
    image.alt = item.imageAlt || "";
    note.hidden = !item.screenshotNote;
    note.textContent = item.screenshotNote || "";
    const fields = card.querySelector(".library-card-fields");
    fields.replaceChildren();
    item.fields.forEach((field) => {
      const group = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = field.label;
      description.textContent = field.value;
      group.append(term, description);
      fields.append(group);
    });
    link.hidden = !item.link;
    if (item.link) {
      link.href = item.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Open project ↗";
    }
    cardOverlay.hidden = false;
    unlockSkill(item);
    walking = false;
    arrivalAction = null;
    controls.clear();
    player.classList.remove("is-moving");
    card.querySelector(".library-card-close").focus();
  }

  function closeLibraryCard() {
    if (!cardOverlay || cardOverlay.hidden) return;
    cardOverlay.hidden = true;
    lastNearbyId = nearestLibraryObject()?.id || "";
  }

  function nearestLibraryObject() {
    if (!currentLibrary) return null;
    const library = sceneDefinition();
    const objects = [...library.items, { id: "library-exit", label: "Return to Castle World", walkX: 0.15, walkY: 0.89 }];
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    return objects.find((item) => Math.hypot(x - item.walkX * width, y - item.walkY * height) < 76) || null;
  }

  function updateLibraryProximity() {
    if (!currentLibrary || !libraryLayer || cardOverlay?.hidden === false) return;
    const nearby = nearestLibraryObject();
    const hint = libraryLayer.querySelector(".library-hint");
    if (nearby) {
      hint.textContent = `Nearby: ${nearby.label} · Press E or click to open`;
      if (nearby.id !== "library-exit" && nearby.id !== lastNearbyId) {
        lastNearbyId = nearby.id;
        openLibraryCard(sceneDefinition().items.find((item) => item.id === nearby.id));
      }
    } else {
      lastNearbyId = "";
      if (hint) hint.textContent = "Walk the library floor · Click a glowing book or shelf";
    }
  }

  function returnToCastle() {
    if (!currentLibrary || transitioning) return;
    transitioning = true;
    fade.classList.add("is-active");
    window.setTimeout(() => {
      currentLibrary = null;
      markSceneVisited("castle");
      libraryLayer?.remove();
      cardOverlay?.remove();
      libraryLayer = null;
      cardOverlay = null;
      stage.classList.remove("is-library");
      stage.style.setProperty("--stage-image", 'url("picture/background.jpeg")');
      if (hudTitle) hudTitle.textContent = copy.castleTitle || "Castle World";
      if (worldBadge) worldBadge.textContent = "WORLD 02 ✦";
      if (hudProgress) hudProgress.textContent = "CASTLE WORLD · 02 / 05";
      if (kicker) kicker.textContent = copy.castleKicker || "A new world opens";
      if (heading) heading.innerHTML = copy.castleHeading || "Welcome to the<br><span>Castle World.</span>";
      if (intro) intro.textContent = copy.castleIntro || "The towers are waiting.";
      x = stage.clientWidth * 0.51;
      y = stage.clientHeight * 0.84;
      targetX = x;
      targetY = y;
      transitioning = false;
      stage.dataset.actionHint = "Castle World · Choose a castle library or visit the Skills Garden";
      renderPlayer();
      addCastleHotspots();
      syncSceneNav();
      window.setTimeout(() => fade.classList.remove("is-active"), reduceMotion.matches ? 0 : 70);
    }, reduceMotion.matches ? 0 : 420);
  }

  function returnHome() {
    if (transitioning || (!castleWorld && !currentLibrary)) return;
    transitioning = true;
    fade.classList.add("is-active");
    window.setTimeout(() => {
      currentLibrary = null;
      castleWorld = false;
      libraryLayer?.remove();
      cardOverlay?.remove();
      libraryLayer = null;
      cardOverlay = null;
      magicBagPanel = null;
      castleHotspots?.remove();
      castleHotspots = null;
      stage.classList.remove("is-library", "is-castle-world");
      stage.style.setProperty("--stage-image", 'url("picture/home.jpeg")');
      if (gate.parentElement !== stage) stage.append(gate);
      gate.classList.remove("is-opening");
      if (hudTitle) hudTitle.textContent = copy.homeTitle || "The little door to adventure";
      if (worldBadge) worldBadge.textContent = "WORLD 01 ✦";
      if (hudProgress) hudProgress.textContent = "HOME · 01 / 05";
      if (kicker) kicker.textContent = data.home?.kicker || "A curious mind in her making";
      if (heading) heading.innerHTML = data.home?.title || "Hi, I’m Turkan.<br><span>I make ideas feel possible.</span>";
      if (intro) intro.textContent = copy.homeIntro || "Step through the glowing doorway and discover the Castle World.";
      x = stage.clientWidth * 0.18;
      y = Math.min(stage.clientHeight * 0.84, walkBottom());
      targetX = x;
      targetY = y;
      walking = false;
      entering = false;
      transitioning = false;
      player.classList.remove("is-moving");
      stage.dataset.actionHint = "Click or drag to walk · Click the door to enter the Castle World";
      markSceneVisited("home");
      renderPlayer();
      window.setTimeout(() => fade.classList.remove("is-active"), reduceMotion.matches ? 0 : 70);
    }, reduceMotion.matches ? 0 : 420);
  }

  function navigateToScene(id, button) {
    if (id === "home") {
      returnHome();
      return;
    }
    if (currentLibrary === id || transitioning) return;
    if (!currentLibrary) {
      castleWorld = true;
      gate.remove();
      stage.classList.add("is-castle-world");
      enterLibrary(id, button);
      return;
    }
    transitioning = true;
    fade.classList.add("is-active");
    window.setTimeout(() => {
      libraryLayer?.remove();
      cardOverlay?.remove();
      libraryLayer = null;
      cardOverlay = null;
      currentLibrary = null;
      stage.classList.remove("is-library");
      transitioning = false;
      enterLibrary(id, button);
    }, reduceMotion.matches ? 0 : 420);
  }

  function tick(timestamp) {
    animationFrame = 0;
    const dt = Math.min(0.04, Math.max(0, (timestamp - (previousFrame || timestamp)) / 1000));
    previousFrame = timestamp;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const direction = [...controls].reduce((sum, key) => [sum[0] + keyDirections.get(key)[0], sum[1] + keyDirections.get(key)[1]], [0, 0]);

    if (!entering && (direction[0] || direction[1])) {
      const length = Math.hypot(direction[0], direction[1]) || 1;
      x = Math.max(width * 0.04, Math.min(width * 0.96, x + (direction[0] / length) * 235 * dt));
      y = Math.max(height * (currentLibrary ? 0.73 : 0.56), Math.min(walkBottom(), y + (direction[1] / length) * 235 * dt));
      targetX = x;
      targetY = y;
    } else if (walking) {
      const dx = targetX - x;
      const dy = targetY - y;
      const distance = Math.hypot(dx, dy);
      const step = (entering ? 270 : 225) * dt;
      if (distance <= step + 1) {
        x = targetX;
        y = targetY;
        walking = false;
        player.classList.remove("is-moving");
        if (entering) revealCastle();
        else if (arrivalAction) {
          const action = arrivalAction;
          arrivalAction = null;
          action();
        }
      } else if (distance > 0) {
        x += (dx / distance) * step;
        y += (dy / distance) * step;
        player.classList.toggle("faces-left", dx < 0);
      }
    }

    renderPlayer();
    updateLibraryProximity();
    if (walking || controls.size) requestFrame();
    else previousFrame = 0;
  }

  gate.addEventListener("click", enterCastle);
  sceneNav.querySelectorAll(".scene-nav-item").forEach((button) => {
    button.addEventListener("click", () => navigateToScene(button.dataset.scene, button));
  });
  markSceneVisited("home");
  stage.addEventListener("pointerdown", (event) => {
    if (event.target.closest("a, button, .library-card-overlay, .magic-bag-panel")) return;
    pointerId = event.pointerId;
    stage.setPointerCapture(pointerId);
    const rect = stage.getBoundingClientRect();
    requestWalk(event.clientX - rect.left, event.clientY - rect.top);
  });
  stage.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointerId) return;
    const rect = stage.getBoundingClientRect();
    requestWalk(event.clientX - rect.left, event.clientY - rect.top);
  });
  const releasePointer = (event) => { if (event.pointerId === pointerId) pointerId = null; };
  stage.addEventListener("pointerup", releasePointer);
  stage.addEventListener("pointercancel", releasePointer);
  stage.addEventListener("wheel", (event) => {
    event.preventDefault();
    if (currentLibrary) {
      if (event.deltaY < 0) returnToCastle();
      else {
        const nearby = nearestLibraryObject();
        if (nearby && nearby.id !== "library-exit") walkToLibraryObject(nearby);
      }
      return;
    }
    if (event.deltaY > 0) enterCastle();
  }, { passive: false });

  window.addEventListener("keydown", (event) => {
    if (entering || transitioning) return;
    if (event.key === "Escape" && cardOverlay?.hidden === false) {
      event.preventDefault();
      closeLibraryCard();
      return;
    }
    if (cardOverlay?.hidden === false) return;
    if (event.key === "e" || event.key === "E") {
      if (currentLibrary) {
        const nearby = nearestLibraryObject();
        if (nearby) {
          event.preventDefault();
          if (nearby.id === "library-exit") returnToCastle();
          else walkToLibraryObject(nearby);
        }
        return;
      }
      if (castleWorld && castleHotspots) {
        const nearest = [...castleHotspots.querySelectorAll(".castle-object")].sort((a, b) => {
          const da = Math.hypot(x - parseFloat(a.style.left) / 100 * stage.clientWidth, y - parseFloat(a.style.top) / 100 * stage.clientHeight);
          const db = Math.hypot(x - parseFloat(b.style.left) / 100 * stage.clientWidth, y - parseFloat(b.style.top) / 100 * stage.clientHeight);
          return da - db;
        })[0];
        if (nearest) {
          const distance = Math.hypot(x - parseFloat(nearest.style.left) / 100 * stage.clientWidth, y - parseFloat(nearest.style.top) / 100 * stage.clientHeight);
          if (distance < 160) { event.preventDefault(); nearest.click(); }
        }
        return;
      }
      const nearGate = Math.hypot(x - stage.clientWidth * 0.51, y - stage.clientHeight * 0.64) < 155;
      if (nearGate) { event.preventDefault(); enterCastle(); }
      return;
    }
    if (!keyDirections.has(event.key)) return;
    event.preventDefault();
    walking = false;
    arrivalAction = null;
    controls.add(event.key);
    player.classList.add("is-moving");
    requestFrame();
  });
  window.addEventListener("keyup", (event) => {
    controls.delete(event.key);
    if (!controls.size && !walking) player.classList.remove("is-moving");
  });
  window.addEventListener("blur", () => controls.clear());

  document.querySelectorAll("[data-move]").forEach((button) => {
    const key = button.dataset.move === "left" ? "ArrowLeft" : "ArrowRight";
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      controls.add(key);
      player.classList.add("is-moving");
      requestFrame();
    });
    const release = () => controls.delete(key);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  });
  window.addEventListener("resize", renderPlayer);
  stage.dataset.actionHint = "Click or drag to walk · Click the door to enter the Castle World";
  if (liveMessage) liveMessage.textContent = "Click or drag to walk. Click the glowing door to enter the Castle World.";
  renderPlayer();
}
