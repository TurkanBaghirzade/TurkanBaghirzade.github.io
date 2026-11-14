# Turkan Baghirzade — Personal Portfolio

A personal portfolio for sharing my studies, interests, and project work. The site uses a 2D game-inspired starlight-fairy theme, the fairy character from my uploaded concept image, original CSS artwork, and my own photos.

## Pages and features

- **Home (`index.html`):** a normal, scrollable portfolio homepage with a first visit choice between the classic site and the game.
- **Game (`game.html`):** the full-screen fairy game entry. The Classic view link returns to the normal homepage.
- **My journey (`about.html`):** the portal world, real portrait, fairy concept, education, interests, and interactive quest tracker.
- **Projects (`projects.html`):** the workshop world and hackathon/coursework project cards, with my role or contribution where available.
- **Exploration:** click or drag on the ground to walk, or use arrow keys/WASD. Open the glowing gate by clicking, pressing E nearby, or scrolling; explore the library, interact with its books, blackboard, trophy shelf, and sketchbook, then use its exit to return outside.
- **Responsive layout:** navigation and content adapt to smaller screens, with reduced-motion support.

The quest tracker saves progress in the visitor's browser using `localStorage`. The site does not use a server, collect form data, or display a public email address.

## Project structure

```text
.
├── index.html
├── game.html
├── about.html
├── projects.html
├── styles.css
├── script.js
├── game.js
├── js/
│   └── data.js
├── picture/
│   ├── Turkan.jpeg
│   ├── background.jpeg
│   ├── contact.jpeg
│   ├── home.jpeg
│   ├── library.jpeg
│   ├── personality.jpeg
│   ├── projects.jpeg
│   └── skills.jpeg
├── assets/
│   ├── fairy-avatar.svg
│   └── turkan-fairy.png
└── README.md
```

## Run locally

Open `index.html` in a browser. No build step or package installation is required. The first visit choice is remembered in local storage.

## Publish with GitHub Pages

1. Push this repository to the `main` branch of `TurkanBaghirzade/TurkanBaghirzade.github.io`.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. After GitHub Pages finishes deploying, visit <https://TurkanBaghirzade.github.io/>.

## Project notes

Project descriptions are based on my current recollection of my work. Robotics is marked as upcoming because I have not started it yet. I will add details and project images after I have completed that work.

This repository contains the website source. The full AI conversation export required by the course is a separate submission item and should be exported from the AI chat interface.
