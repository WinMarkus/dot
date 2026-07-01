# Dot

A minimal generative creation canvas prototype.

Milestone 1 implements the core interaction:

- blank spatial workspace
- draggable pulsing green seed dot
- click the dot to open the prompt bar
- active dot turns warm orange
- submit a prompt to create a mock artifact near the dot
- generated artifacts materialize onto the canvas

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL in your browser.

## Current scope

This is intentionally not connected to an LLM yet. The generation step uses a short fake delay and creates a mock artifact card from the prompt. The next milestone can replace that fake step with a real `/api/generate` route and an artifact schema.
