/* Shared portfolio copy for the normal site and game worlds. */
window.PORTFOLIO_DATA = {
  home: {
    kicker: "A curious mind in her making",
    title: "Hi, I’m Turkan.<br><span>I make ideas feel possible.</span>",
    intro: "CS student, builder, and hopeful AI tinkerer. I like turning ideas into useful things.",
    note: "Still learning, building, and finding new things to be curious about.",
    caption: "Computer science student · creative builder",
    glance: ["CS learner", "Hackathon teammate", "Future AI builder", "Badminton + sketchbooks"],
    welcomeKicker: "Welcome to my world",
    welcome: "I'm Turkan, a computer science student who likes turning ideas into useful things. Follow the fairy trail to meet me, see what I’m learning, and explore my projects.",
    gameTitle: "The first sparkle",
    gameLink: "Begin the adventure"
  },
  about: {
    kicker: "My journey",
    title: "A little learning, a lot of becoming.",
    intro: "I’m building my path through computer science, team projects, and ideas for useful AI tools.",
    hackathonsTitle: "Hackathons and team projects",
    hackathonsIntro: "A few of the teams and ideas I’ve contributed to so far.",
    hackathons: [
      { title: "GoGarabakh", text: "A travel website with reservations, tours, an AI tour planner, and a KarabakhCoin concept. I contributed as a frontend developer." },
      { title: "CareerAI", text: "A CV planning project where I worked across frontend and backend development." },
      { title: "Encore", text: "A game-discovery service for rediscovering owned games, tracking free games and discounts, and choosing what to play next." },
      { title: "AI for Business Management", text: "A hackathon idea to help businesses choose promising ideas more easily." }
    ],
    cards: [
      "I’m Turkan, a computer science student building my own path one project at a time. I enjoy making useful things and bringing a little creativity to the process.",
      "I completed Holberton School’s nine-month computer science program. I’m currently a first-year student at ADA University.",
      "My current skills include C, Python, HTML, CSS, Shell, Git, and GitHub. I’m especially interested in building AI-powered tools.",
      "I enjoy playing badminton and drawing. Both give me a welcome change of pace and room for new ideas."
    ]
  },
  projects: [
    { title: "Logic Gates", description: "For Project 1, I built an OR gate and helped with editing as part of this introductory course project.", role: "My contribution · OR gate", image: "picture/projects.jpeg", imageAlt: "Portfolio artwork used while a Logic Gates project screenshot is unavailable.", screenshotNote: "Project screenshot placeholder: replace this portfolio image with a Logic Gates screenshot when available." },
    { title: "Hour of Code", description: "For Project 2, our team taught algorithms through Hour of Code, introducing step-by-step problem solving.", role: "My contribution · Teaching algorithms", image: "picture/skills.jpeg", imageAlt: "Portfolio artwork used while an Hour of Code project screenshot is unavailable.", screenshotNote: "Project screenshot placeholder: replace this portfolio image with an Hour of Code screenshot when available." },
    { title: "Robotics", description: "Robotics has not started yet. I’ll add details here once I have begun the project.", role: "Coming soon", image: "picture/library.jpeg", imageAlt: "Portfolio artwork used while a Robotics project screenshot is unavailable.", screenshotNote: "Project screenshot placeholder: replace this portfolio image with a Robotics screenshot when available." },
    { title: "GoGarabakh", description: "A hackathon travel project for exploring Karabakh, with tour and reservation ideas, an AI tour planner, and a KarabakhCoin concept.", role: "My role · Frontend developer" },
    { title: "CareerAI", description: "A hackathon project focused on career planning with AI. I contributed to both frontend and backend development.", role: "My role · Frontend + backend" },
    { title: "Encore", description: "A game-discovery web service that helps people find games to play, including games they already own.", role: "Team project" },
    { title: "AI for Business Management", description: "A hackathon project exploring how AI could help with business management and decision-making.", role: "Team project" }
  ],
  projectsPage: {
    kicker: "Coursework",
    title: "Projects I’m learning through.",
    intro: "Three projects from my university path, with room to add screenshots and details as the work grows.",
    courseProject: "COURSE PROJECT",
    projectOne: "PROJECT 1",
    projectTwo: "PROJECT 2",
    projectThree: "PROJECT 3",
    upNext: "UP NEXT"
  },
  gameObjects: [
    {
      id: "education", icon: "📚", label: "Open the books", title: "A lesson in learning",
      body: "I’m in my first year at ADA University and also studying computer science through Holberton School’s nine-month program.",
      image: "picture/Turkan.jpeg", alt: "Turkan outdoors, wearing a yellow top", x: 0.37, y: 0.59, walkX: 0.25, walkY: 0.89
    },
    {
      id: "skills", icon: "✎", label: "Read the blackboard", title: "Tools in my kit",
      body: "I’m learning and building with C, Python, HTML, CSS, Shell, Git, and GitHub. I’m especially curious about AI-powered tools.",
      image: "picture/skills.jpeg", alt: "A visual from Turkan’s skills portfolio", x: 0.84, y: 0.56, walkX: 0.77, walkY: 0.79
    },
    {
      id: "projects", icon: "🏆", label: "Inspect the trophy shelf", title: "Projects and hackathons",
      body: "I worked on GoGarabakh as a frontend developer and CareerAI across frontend and backend. Encore is a game-discovery web service. I also joined an AI-for-business-management hackathon project.",
      image: "picture/projects.jpeg", alt: "A visual from Turkan’s projects portfolio", x: 0.68, y: 0.65, walkX: 0.73, walkY: 0.91
    },
    {
      id: "outside-code", icon: "✧", label: "Browse the sketchbook", title: "Away from the screen",
      body: "Badminton and drawing are two of my favorite ways to reset and make room for new ideas.",
      image: "picture/personality.jpeg", alt: "Turkan’s original fairy character concept", x: 0.48, y: 0.7, walkX: 0.45, walkY: 0.92
    }
  ],
  worlds: {
    homeDoor: "ENTER THE CASTLE WORLD",
    homeTitle: "The little door to adventure",
    homeIntro: "Step through the glowing doorway and discover the Castle World.",
    castleTitle: "Castle World",
    castleKicker: "A new world opens",
    castleHeading: "Welcome to the<br><span>Castle World.</span>",
    castleIntro: "Explore the Holberton and ADA castles, or visit the Skills Garden to collect languages and hobbies."
  },
  libraries: {
    school: {
      title: "School Library",
      subtitle: "HOLBERTON SCHOOL · NINE-MONTH CS PROGRAM",
      background: "picture/library.jpeg",
      intro: "Two glowing volumes from my hackathons and gameathon work.",
      items: [
        {
          id: "gogarabakh", icon: "📘", label: "GoGarabakh", title: "GoGarabakh · Hackathon",
          x: 0.38, y: 0.56, walkX: 0.23, walkY: 0.89,
          image: "picture/projects.jpeg", imageAlt: "Portfolio illustration for project work",
          fields: [
            { label: "Date", value: "Not provided" },
            { label: "My role", value: "Frontend developer" },
            { label: "What we built", value: "A Karabakh travel website with multiple sections: reservations, tours, an AI tour planner, and a KarabakhCoin system." },
            { label: "Related skills", value: "My wider toolkit includes C, Python, Shell, and web frontend technologies; the project-specific stack was not recorded." },
            { label: "What I learned", value: "I gained practice bringing several product features together into one website and contributing frontend work on a team." }
          ]
        },
        {
          id: "other-hackathons", icon: "🏆", label: "More hackathon projects", title: "CareerAI, Encore & AI for Business",
          x: 0.82, y: 0.55, walkX: 0.8, walkY: 0.88,
          image: "picture/skills.jpeg", imageAlt: "Portfolio illustration for learning and technical skills",
          fields: [
            { label: "Date", value: "Dates not provided" },
            { label: "My role", value: "CareerAI: frontend and backend developer. Encore and AI for Business Management: team projects; an individual role was not specified." },
            { label: "What we built", value: "CareerAI supported CV planning. Encore helps players rediscover games they own, track free games and discounts, and choose what to play next based on their gaming activity. AI for Business Management explored helping teams choose promising hackathon ideas more easily." },
            { label: "Related skills", value: "My broader skills include C, Python, Shell, HTML, CSS, and Git/GitHub. Project-specific technology details were not provided." },
            { label: "What I learned", value: "These projects gave me practice thinking about user needs across different products, from career planning and game discovery to business idea selection." }
          ]
        }
      ]
    },
    university: {
      title: "University Library",
      subtitle: "ADA UNIVERSITY · COURSE PROJECTS",
      background: "picture/projects.jpeg",
      intro: "Browse the three projects from my university learning path.",
      items: [
        {
          id: "logic-gates", icon: "📗", label: "Project 1 · Logic Gates", title: "Project 1: Logic Gates",
          x: 0.22, y: 0.43, walkX: 0.18, walkY: 0.88,
          image: "picture/projects.jpeg", imageAlt: "University project portfolio artwork",
          screenshotNote: "Project screenshot not supplied; this is the portfolio scene artwork.",
          fields: [
            { label: "Description", value: "I built an OR gate and helped with editing as part of the Logic Gates project." },
            { label: "Technologies", value: "The specific tools were not provided." }
          ]
        },
        {
          id: "hour-of-code", icon: "📙", label: "Project 2 · Hour of Code", title: "Project 2: Hour of Code",
          x: 0.78, y: 0.43, walkX: 0.82, walkY: 0.88,
          image: "picture/projects.jpeg", imageAlt: "University project portfolio artwork",
          screenshotNote: "Project screenshot not supplied; this is the portfolio scene artwork.",
          fields: [
            { label: "Description", value: "Our team taught algorithms through Hour of Code, introducing step-by-step problem solving." },
            { label: "Technologies", value: "The teaching platform and specific tools were not provided; the lesson focused on algorithms." }
          ]
        },
        {
          id: "robotics", icon: "🤖", label: "Project 3 · Robotics", title: "Project 3: Robotics",
          x: 0.53, y: 0.65, walkX: 0.54, walkY: 0.92,
          image: "picture/projects.jpeg", imageAlt: "University project portfolio artwork",
          screenshotNote: "Robotics has not started, so there is no project screenshot yet.",
          fields: [
            { label: "Description", value: "Robotics has not started yet. I’ll add the project details when I begin." },
            { label: "Technologies", value: "Not started yet." }
          ]
        }
      ]
    }
  },
  skillsScene: {
    title: "Skills Garden",
    subtitle: "PROGRAMMING LANGUAGES · HOBBIES",
    background: "picture/skills.jpeg",
    intro: "Explore six glowing markers. Open a card to collect it in your Magic Bag.",
    magicBag: {
      title: "Magic Bag",
      empty: "Open a glowing object to collect your first skill."
    },
    items: [
      { id: "skill-c", icon: "C", label: "C", title: "C", x: 0.19, y: 0.39, walkX: 0.15, walkY: 0.88, fields: [{ label: "About C", value: "Placeholder: write your own short note about C here." }] },
      { id: "skill-python", icon: "🐍", label: "Python", title: "Python", x: 0.4, y: 0.42, walkX: 0.39, walkY: 0.88, fields: [{ label: "About Python", value: "Placeholder: write your own short note about Python here." }] },
      { id: "skill-html", icon: "🌐", label: "HTML", title: "HTML", x: 0.61, y: 0.39, walkX: 0.62, walkY: 0.88, fields: [{ label: "About HTML", value: "Placeholder: write your own short note about HTML here." }] },
      { id: "skill-css", icon: "✿", label: "CSS", title: "CSS", x: 0.82, y: 0.43, walkX: 0.84, walkY: 0.88, fields: [{ label: "About CSS", value: "Placeholder: write your own short note about CSS here." }] },
      { id: "hobby-badminton", icon: "🏸", label: "Badminton", title: "Badminton", x: 0.32, y: 0.62, walkX: 0.3, walkY: 0.92, fields: [{ label: "About badminton", value: "Placeholder: write your own short note about badminton here." }] },
      { id: "hobby-drawing", icon: "🎨", label: "Drawing", title: "Drawing", x: 0.7, y: 0.62, walkX: 0.7, walkY: 0.92, fields: [{ label: "About drawing", value: "Placeholder: write your own short note about drawing here." }] }
    ]
  },
  sceneNavigation: {
    items: [
      { id: "home", label: "Home" },
      { id: "university", label: "University Library" },
      { id: "school", label: "School Library" },
      { id: "skills", label: "Skills" }
    ],
    progressLabel: "Scenes visited"
  },
  footer: {
    githubLabel: "GitHub",
    githubUrl: "https://github.com/TurkanBaghirzade",
    tagline: "Still learning. Still making. ✧",
    copyright: "Turkan Baghirzade · Made with curiosity and a little stardust."
  }
};

document.querySelectorAll("[data-copy]").forEach((node) => {
  const value = node.dataset.copy.split(".").reduce((entry, key) => entry && entry[key], window.PORTFOLIO_DATA);
  if (Array.isArray(value)) {
    const index = Number(node.dataset.copyIndex || node.dataset.copy.split(".").pop());
    node.textContent = value[index] || "";
  } else if (typeof value === "string") {
    node.innerHTML = value;
  }
});

document.querySelectorAll("[data-image]").forEach((node) => {
  const value = node.dataset.image.split(".").reduce((entry, key) => entry && entry[key], window.PORTFOLIO_DATA);
  if (typeof value === "string") node.src = value;
});
document.querySelectorAll("[data-image-alt]").forEach((node) => {
  const value = node.dataset.imageAlt.split(".").reduce((entry, key) => entry && entry[key], window.PORTFOLIO_DATA);
  if (typeof value === "string") node.alt = value;
});
document.querySelectorAll("[data-href]").forEach((node) => {
  const value = node.dataset.href.split(".").reduce((entry, key) => entry && entry[key], window.PORTFOLIO_DATA);
  if (typeof value === "string") node.href = value;
});

