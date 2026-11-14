const questItems = document.querySelectorAll(".quest-item");
const xpCount = document.querySelector("#xp-count");
const xpFill = document.querySelector("#xp-fill");
const xpProgress = document.querySelector("#xp-progress");
const levelNumber = document.querySelector("#level-number");
const questMessage = document.querySelector("#quest-message");
const currentYear = document.querySelector("#current-year");
const githubLinks = document.querySelectorAll('a[href*="github.com/TurkanBaghirzade"]');
const storageKey = "turkan-starlight-quests";

function saveCompletedQuests() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(completedQuests));
  } catch (error) {
    console.warn("Could not save quest progress on this device.", error);
  }
}

function readCompletedQuests() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(saved) ? saved.filter((quest) => typeof quest === "string") : [];
  } catch (error) {
    console.warn("Could not read saved quest progress.", error);
    return [];
  }
}

function updateQuestProgress(completed) {
  const activeQuests = [...questItems];
  const earnedXp = activeQuests.reduce((total, button) => {
    const isComplete = completed.includes(button.dataset.quest);
    button.setAttribute("aria-pressed", String(isComplete));
    return total + (isComplete ? Number(button.dataset.xp) : 0);
  }, 0);
  const level = Math.floor(earnedXp / 30) + 1;
  const levelProgress = earnedXp % 30;

  xpCount.textContent = String(levelProgress);
  levelNumber.textContent = String(level).padStart(2, "0");
  xpFill.style.width = `${(levelProgress / 30) * 100}%`;
  xpProgress.setAttribute("aria-valuenow", String(levelProgress));

  if (earnedXp === 90) {
    questMessage.textContent = "All quests complete—your stardust shines bright!";
  } else if (earnedXp > 0) {
    questMessage.textContent = `${earnedXp} stardust earned. One small step at a time!`;
  } else {
    questMessage.textContent = "Every small step counts. You’ve got this!";
  }
}

let completedQuests = readCompletedQuests();

if (questItems.length > 0) {
  updateQuestProgress(completedQuests);

  questItems.forEach((item) => {
    item.addEventListener("click", () => {
      const quest = item.dataset.quest;
      completedQuests = completedQuests.includes(quest)
        ? completedQuests.filter((completed) => completed !== quest)
        : [...completedQuests, quest];
      saveCompletedQuests();
      updateQuestProgress(completedQuests);
    });
  });

  githubLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (!completedQuests.includes("github")) {
        completedQuests = [...completedQuests, "github"];
        saveCompletedQuests();
        updateQuestProgress(completedQuests);
      }
    });
  });
}

if (currentYear) currentYear.textContent = String(new Date().getFullYear());

const welcomeOverlay = document.querySelector("[data-welcome-overlay]");
const choiceKey = "turkan-portfolio-view";

if (welcomeOverlay) {
  let savedChoice = "";
  try {
    savedChoice = localStorage.getItem(choiceKey) || "";
  } catch (error) {
    console.warn("Could not read the saved portfolio view.", error);
  }

  if (savedChoice === "game") {
    window.location.replace("game.html");
  } else if (savedChoice !== "classic") {
    welcomeOverlay.hidden = false;
    welcomeOverlay.querySelector('[data-choice="game"]').focus();
  }

  welcomeOverlay.querySelector('[data-choice="game"]').addEventListener("click", () => {
    try { localStorage.setItem(choiceKey, "game"); } catch (error) {
      console.warn("Could not save the selected portfolio view.", error);
    }
  });

  welcomeOverlay.querySelector('[data-choice="classic"]').addEventListener("click", () => {
    try { localStorage.setItem(choiceKey, "classic"); } catch (error) {
      console.warn("Could not save the selected portfolio view.", error);
    }
    welcomeOverlay.hidden = true;
  });
}

document.querySelectorAll(".classic-link").forEach((link) => {
  link.addEventListener("click", () => {
    try { localStorage.setItem(choiceKey, "classic"); } catch (error) {
      console.warn("Could not save the selected portfolio view.", error);
    }
  });
});

document.querySelectorAll(".play-game-button").forEach((link) => {
  link.addEventListener("click", () => {
    try { localStorage.setItem(choiceKey, "game"); } catch (error) {
      console.warn("Could not save the selected portfolio view.", error);
    }
  });
});
