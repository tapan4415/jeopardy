# Jeopardy Game Board 🎯

A multiplayer Jeopardy-style game board built with React + Vite, hosted on GitHub Pages.

## Features

- **6 categories × 5 values** (20, 40, 60, 80, 100 points)
- **4 groups** playing in rotation
- **20-second timer** per clue
- **Host-controlled** — reveal answers and judge correct/incorrect
- **Customizable questions** via JSON file

## Getting Started

### Prerequisites
- Node.js 18+

### Install & Run Locally
```bash
cd jeopardy
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Host Password

The default host password is `cpe`. To use a different password, set
`VITE_GAME_PASSWORD` before building or starting the app. This is a lightweight
client-side gate intended to keep guests from opening the host controls; it is
not a substitute for server-side authentication.

### Build for Production
```bash
npm run build
npm run preview
```

## Customizing Questions

Edit `public/data/questions.json` with your own categories and clues:

```json
{
  "categories": [
    {
      "name": "Your Category",
      "clues": [
        { "value": 20, "clue": "Your question here...", "answer": "What is your answer?" },
        { "value": 40, "clue": "...", "answer": "..." },
        { "value": 60, "clue": "...", "answer": "..." },
        { "value": 80, "clue": "...", "answer": "..." },
        { "value": 100, "clue": "...", "answer": "..." }
      ]
    }
  ]
}
```

You need exactly 6 categories with 5 clues each.

### Image, audio, and video clues

Place media files in `public/data/media/`, then add a `media` object to a clue:

```json
{
  "value": 20,
  "clue": "Name this tune.",
  "answer": "What is Happy Birthday to You?",
  "media": {
    "type": "audio",
    "src": "./data/media/happy-birthday.mp3"
  }
}
```

Supported media types are `image`, `audio`, and `video`. Video entries may also
include an optional `poster` image and `mimeType` value. Use media you created,
licensed, or have permission to distribute.

### Media credits

- Istanbul panorama: Salih K, Wikimedia Commons (GFDL/CC BY-SA).
- Edinburgh Castle: oskar karlin, Wikimedia Commons (CC BY-SA 2.0).
- Vinay Pathak portrait: Bollywood Hungama, Wikimedia Commons (CC BY 3.0).
- Ranvir Shorey portrait: Bollywood Hungama, Wikimedia Commons (CC BY 3.0).
- Rajat Kapoor portrait: Bollywood Hungama, Wikimedia Commons (CC BY 3.0).
- Nahargarh Fort courtyard: Vijay Singh, Wikimedia Commons (CC BY-SA 4.0).
- Hawa Mahal, Jaipur: Wikimedia Commons, “Hawa Mahal Jaipur.jpg” (public domain).
- Living root bridge, Cherrapunji landscape, and Khasi Hills scenery: Wikimedia Commons; see the source-file metadata for attribution and license details.
- Meenakshi Amman Temple aerial view: Prakashkumar, Wikimedia Commons (CC BY-SA 4.0).
- Konark Sun Temple wheel: Wikimedia Commons; see “Konark-sun-temple-wheel.jpg” for source metadata.

## How to Play

1. Enter 4 group names on the setup screen
2. Groups take turns selecting clues from the board
3. Read the full-screen question, then start the 20-second timer
4. For tune clues, the full clip plays before the timer starts and can be replayed
5. The host may pause the timer or the whole game at any time
6. The host judges ✅ Correct or ❌ Wrong / Pass, including after time expires
7. The answer stays visible until the host returns to the board
8. Use Undo Last Result if the latest score decision was accidental
9. Game ends when all 30 clues are used

## Deployment

The game auto-deploys to GitHub Pages on push to the `varunih/baseCode` branch via GitHub Actions.

## Tech Stack

- React 19 + Vite
- CSS (no UI framework)
- GitHub Pages + GitHub Actions

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
