# Dot

A minimal generative creation canvas prototype.

## Current interaction model

- blank spatial workspace
- draggable pulsing green seed dot
- click the dot to open the prompt bar
- active dot turns warm orange
- submit a prompt to create a mock artifact near the dot
- generated artifacts materialize onto the canvas
- generated artifacts are draggable
- selected artifacts show a small action dot
- hover or focus the action dot to bloom action sub-dots
- the old visible inspect button has been removed
- canvas controls live behind the bottom-left `?` help dot
- drag the background to pan the camera
- mouse wheel zooms the camera
- press `F` to fit all current objects
- press `0` to reset the camera to the seed dot

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL in your browser.

## Current scope

This is intentionally not connected to an LLM yet. The generation step uses a short fake delay and creates a mock artifact card from the prompt. The next milestone can replace that fake step with a real `/api/generate` route and an artifact schema.
