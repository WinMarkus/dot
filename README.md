# Dot

A minimal generative creation canvas prototype.

## Current interaction model

- blank spatial workspace
- draggable pulsing green seed dot
- click the dot to open the prompt bar
- active dot turns warm orange
- submit a prompt to create a typed artifact near the dot
- current fake generator detects text, object, image, video, or unknown artifacts
- object artifacts use a universal shell with tags, capabilities, and possible connections
- the shell avoids domain-specific UI assumptions; meaning should come from the model
- generated artifacts materialize onto the canvas
- generated artifacts are draggable
- newly created artifacts are selected automatically
- selected artifacts show a small action dot
- hover or focus the action dot on desktop to bloom action sub-dots
- tap the action dot on touch devices to toggle action sub-dots
- action sub-dots currently support inspect, prompt, fork, and delete
- inspect opens a lightweight artifact inspector
- the inspector animates out of the clicked inspect icon
- on mobile the inspector behaves as a bottom sheet
- prompt reopens the bottom prompt bar in artifact-editing mode
- in edit mode, submitting an empty prompt regenerates the artifact from its existing prompt
- in edit mode, typing an instruction changes the artifact
- fork duplicates the artifact nearby
- top-level artifacts can be dragged into other top-level artifacts
- a parent artifact grows and shows contained artifacts as floating round inner bubbles
- inner bubbles show their first letter and animate while the parent is dragged
- clicking an inner bubble extracts it back to the canvas
- inspector shows parent and child-count information
- delete smoothly collapses the artifact into a small red deleted marker
- tapping a deleted marker revitalises the artifact at its original position
- deleted markers can be cleared with the clear deleted dots control
- canvas controls live behind the bottom-left help dot
- drag the background to pan the camera
- mouse wheel zooms the camera
- press F to fit all current objects
- press 0 to reset the camera to the seed dot

## Source structure

- `src/types.ts` contains shared domain and interaction types
- `src/constants.ts` contains core sizing, zoom, and transition constants
- `src/artifact-factory.ts` contains fake generation, artifact cloning, and artifact creation helpers
- `src/artifact-tree.ts` contains parent/child artifact tree helpers
- `src/geometry.ts` contains canvas, camera, and coordinate helpers
- `src/App.vue` still owns runtime interaction orchestration and rendering

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL in your browser.

## Current scope

This is intentionally not connected to a real generator yet. The generation step uses a short fake delay and creates structured artifact placeholders. The next milestone can replace the fake generator with a real API route and a model-routed artifact schema.
