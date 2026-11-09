# Turkan Baghirzade — Personal Portfolio

A personal portfolio for sharing my studies, interests, and project work. The site uses a 2D game-inspired starlight-fairy theme, the fairy character from my uploaded concept image, original CSS artwork, and my own photos.

## Pages and features

- **Home (`index.html`):** a playable opening world, profile photo, and keyboard/touch controls.
- **My journey (`about.html`):** the portal world, real portrait, fairy concept, education, interests, and interactive quest tracker.
- **Projects (`projects.html`):** the workshop world and hackathon/coursework project cards, with my role or contribution where available.
- **2D game interactions:** move the fairy with arrow keys, A/D, or on-screen controls; reach the right edge to transition worlds, or use ordinary links. Pointer movement across the page creates a short-lived magic trail.
- **Responsive layout:** navigation and content adapt to smaller screens, with reduced-motion support.

The quest tracker saves progress in the visitor's browser using `localStorage`. The site does not use a server, collect form data, or display a public email address.

## Project structure

```text
.
├── index.html
├── about.html
├── projects.html
├── styles.css
├── script.js
├── game.js
├── picture/
│   ├── Turkan.jpeg
│   ├── background.jpeg
│   ├── contact.jpeg
│   ├── home.jpeg
│   ├── personality.jpeg
│   ├── projects.jpeg
│   └── skills.jpeg
├── assets/
│   ├── fairy-avatar.svg
│   └── turkan-fairy.png
└── README.md
```

## Run locally

Open `index.html` in a browser. No build step or package installation is required.

## Publish with GitHub Pages

1. Push this repository to the `main` branch of `TurkanBaghirzade/TurkanBaghirzade.github.io`.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. After GitHub Pages finishes deploying, visit <https://TurkanBaghirzade.github.io/>.

## Project notes

Project descriptions are based on my current recollection of my work. Robotics is marked as upcoming because I have not started it yet. I will add details and project images after I have completed that work.

This repository contains the website source. The full AI conversation export required by the course is a separate submission item and should be exported from the AI chat interface.
