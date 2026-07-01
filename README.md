# Dot

A minimal generative creation canvas prototype.

## Current interaction model

- blank spatial workspace
- draggable pulsing green seed dot
- click the dot to open the prompt bar
- active dot turns warm orange
- submit a prompt to create a typed artifact near the dot
- current fake generator detects text, component, image, video, or unknown artifacts
- generated artifacts materialize onto the canvas
- generated artifacts are draggable
- newly created artifacts are selected automatically
- selected artifacts show a small action dot
- hover or focus the action dot on desktop to bloom action sub-dots
- tap the action dot on touch devices to toggle action sub-dots
- action sub-dots currently support inspect, prompt, fork, and delete
- inspect opens a lightweight artifact inspector
- on mobile the inspector behaves as a bottom sheet
- prompt reopens the bottom prompt bar in artifact-editing mode
- fork duplicates the artifact nearby
- delete removes the artifact and leaves a spatial undo bubble where the artifact lived
- if undo expires, a small red deleted marker remains on the canvas
- deleted markers can be cleared with the clear deleted dots control
- canvas controls live behind the bottom-left help dot
- drag the background to pan the camera
- mouse wheel zooms the camera
- press F to fit all current objects
- press 0 to reset the camera to the seed dot

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL in your browser.

## Current scope

This is intentionally not connected to a real generator yet. The generation step uses a short fake delay and creates structured artifact placeholders. The next milestone can replace the fake generator with a real API route and a model-routed artifact schema.
