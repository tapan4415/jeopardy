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

## How to Play

1. Enter 4 group names on the setup screen
2. Groups take turns selecting clues from the board
3. A 20-second timer starts when a clue is selected
4. The host clicks "Reveal Answer" to show the correct answer
5. The host judges ✅ Correct (points awarded) or ❌ Incorrect (no points)
6. Turn passes to the next group
7. Game ends when all 30 clues are used

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
