# Dot

Dot is a spatial workshop where ideas become living, composable artifacts. Its
goal is to shorten the distance between imagining something and having a useful
system: create a piece, see what it can receive and provide, then weave pieces
together until the canvas behaves like a small organism rather than a folder of
isolated AI outputs.

## Current interaction model

- blank spatial workspace
- draggable pulsing green seed dot
- click or double-click the canvas to open the prompt bar at that point
- active dot turns warm orange
- submit a prompt to create typed AI artifacts near the dot
- OpenRouter-backed generation returns text, object, image, video, or component artifacts
- if the AI route is missing or fails, the app falls back to the local placeholder generator
- object artifacts use a universal shell with purpose, ports, tags, and possible connections
- component artifacts are generated as Vue 3 single-file components and rendered in a sandboxed iframe; selecting one enables its controls directly on the canvas
- image artifacts are generated via OpenRouter image models (default Gemini 3.1 Flash Lite Image) and render as real images in the bubble, with a breathing placeholder while painting and a retry control on failure
- the shell avoids domain-specific UI assumptions; meaning should come from the model
- generated artifacts materialize onto the canvas
- generated artifacts are draggable
- newly created artifacts are selected automatically
- bubbles connect: drag from the aura around the selected bubble onto another, or focus the halo and press Enter/Space before choosing a target; the AI names what the connection means ("gives words to", "grows within")
- ports are executable contracts. Dot pairs a compatible output and input, then shows the exact binding and policy on the tendril (for example `count → seed · live`)
- component-to-component bindings carry JSON values immediately through a sandboxed message bridge; interaction in one generated component can visibly update another
- durable or generative content uses a `breathe` connection: a changed upstream value waits at the boundary until the user asks the receiver to absorb and regenerate from it
- feedback cycles are made deliberate: a connection that would close an automatic loop is downgraded to `breathe`, preventing runaway component feedback while preserving the relationship
- connections are living context: whenever a bubble (re)generates, the actual value of its connected upstream port flows in as input
- tendrils render as organic filaments (warm at the giving end, green at the receiving end), wake and carry motes only when data moves, then return to rest; the meaning pill at the midpoint can sever the connection
- artifacts hatched from ghost suggestions arrive pre-connected to their source
- the selected artifact grows ghost suggestions: up to three faint dashed bubbles proposing the next artifact to create (a cheap model imagines expansions, complements, and transformations); one click generates it for real at the ghost's position
- selected artifacts show a small action dot
- hover or focus the action dot on desktop to bloom action sub-dots
- tap the action dot on touch devices to toggle action sub-dots
- action sub-dots currently support inspect, prompt, fork, and delete
- inspect opens a lightweight artifact inspector
- the inspector animates out of the clicked inspect icon
- the inspector is draggable and can edit/regenerate the inspected artifact
- on mobile the inspector behaves as a bottom sheet
- prompt reopens the bottom prompt bar in artifact-editing mode
- in edit mode, submitting an empty prompt regenerates the artifact from its existing prompt
- in edit mode, typing an instruction changes the artifact
- fork duplicates the artifact nearby with a living-cell split animation
- top-level artifacts can be dragged into other top-level artifacts
- a parent artifact grows and shows contained artifacts as floating round inner bubbles
- inner bubbles show their first letter and animate while the parent is dragged
- clicking an inner bubble extracts it back to the canvas
- inspector shows purpose, parent, and child-count information
- delete smoothly collapses the artifact into a small red deleted marker
- red deleted markers are draggable
- tapping a deleted marker revitalises the artifact at its original position
- deleted markers can be cleared with the clear deleted dots control
- closed bubbles preview their content: images render as glossy orbs, components show a live scaled-down miniature, text shows its words fading toward the edge, videos show the play button, objects show their tag chips
- the bottom-right status pill opens a model picker: choose the OpenRouter model for artifact generation and image generation separately (curated live from the OpenRouter catalog, persisted in localStorage)
- three themes — nature (default), technical, space — switched via the small orbs next to the bottom-left help dot and remembered per browser; every color derives from theme tokens in `src/themes.css`
- canvas controls live behind the bottom-left help dot
- drag the background to pan the camera
- mouse wheel zooms the camera
- press F to fit all current objects
- press 0 to reset the camera to the seed dot

## Source structure

- `server/index.mjs` serves the built app and exposes `POST /api/generate`, `POST /api/generate-image`, `POST /api/suggest`, `POST /api/connect`, and `GET /api/models`
- `src/model-picker.ts` loads the curated model catalog and persists the user's model choices
- `src/vue-sfc.ts` parses generated Vue single-file components into template/script/style blocks
- `src/types.ts` contains shared domain and interaction types
- `src/constants.ts` contains core sizing, zoom, and transition constants
- `src/artifact-factory.ts` contains local fallback generation, artifact cloning, and artifact creation helpers
- `src/ai-client.ts` calls the generation API from the frontend
- `src/component-srcdoc.ts` creates sandboxed iframe documents and installs the in-frame `Dot` API
- `src/component-host.ts` owns capability-scoped `MessageChannel` sessions between the canvas and component frames
- `src/connection-contract.ts` pairs compatible ports, chooses live/event/breathe behavior, and adapts static artifacts into port values
- `src/living-runtime.ts` routes immutable packets, revisions, deferred breathes, activity state, and guarded flows without depending on Vue
- `src/artifact-tree.ts` contains parent/child artifact tree helpers
- `src/geometry.ts` contains canvas, camera, and coordinate helpers
- `src/App.vue` still owns runtime interaction orchestration and rendering

## Run locally

Frontend-only fallback mode:

```bash
npm install
npm run dev
```

Full AI mode:

```bash
npm install
npm run build
OPENROUTER_API_KEY=your_key_here npm start
```

Full AI mode with hot reload (two terminals — Vite proxies `/api` to the Express server on port 3000):

```bash
OPENROUTER_API_KEY=your_key_here npm start
npm run dev
```

Optional environment variables (the env models act as defaults; users can pick a different model per browser via the on-site model picker):

```bash
OPENROUTER_MODEL=nvidia/nemotron-3-ultra-550b-a55b:free
OPENROUTER_IMAGE_MODEL=google/gemini-3.1-flash-lite-image
OPENROUTER_SUGGEST_MODEL=nvidia/nemotron-3-ultra-550b-a55b:free
PUBLIC_APP_URL=http://localhost:3000
PORT=3000
```

## Render deployment

AI mode needs a Render Web Service, not a static site.

- build command: `npm install && npm run build`
- start command: `npm start`
- env vars:
  - `OPENROUTER_API_KEY`
  - `OPENROUTER_MODEL` optional, default is `nvidia/nemotron-3-ultra-550b-a55b:free` (zero cost; OpenRouter rate-limits `:free` models to roughly 50 requests/day, more if you hold credits)
  - `OPENROUTER_IMAGE_MODEL` optional, default is `google/gemini-3.1-flash-lite-image` (bump to `google/gemini-3.1-flash-image` or `google/gemini-3-pro-image` for higher quality)
  - `PUBLIC_APP_URL` optional but recommended

## AI generation contract

The backend asks the model to return strict JSON containing canvas artifacts. Root artifacts may contain one level of child artifacts. Each artifact includes:

- `kind`: `text`, `object`, `image`, `video`, or `component`
- `title`
- `purpose`
- `summary`
- `content`
- `ports.inputs`
- `ports.outputs`
- `children`

Generated components are Vue 3 single-file components (in `content.vue`) mounted only inside a sandboxed iframe. The iframe CSP blocks network access and external assets; the only allowed external script is the app-served Vue runtime. Legacy `html`/`css`/`js` components still render through the old sandbox path.

Every port also declares a mode:

- `state`: the latest reactive value, such as a count, selection, or current mood
- `event`: a discrete occurrence, such as submit, grow, or choose
- `resource`: durable generated content, such as text, an image, a dataset, or a video

Inside a generated component, the canvas exposes a small global API before the
component code runs:

```js
const dot = globalThis.Dot;
const mood = Vue.computed(() => dot.inputs.mood ?? 'calm');

function choose(value) {
  dot.emit('selection', { value });
}
```

`Dot.inputs` is a reactive, readonly object keyed by declared input IDs.
`Dot.emit(id, value)` accepts compact JSON-serializable output values keyed by
declared output IDs. `Dot.connected`, `Dot.revision`, and `Dot.version` expose
bridge state for graceful standalone fallbacks and diagnostics. The frame never
receives ambient parent access: the host grants one dedicated message port after
matching the requesting sandboxed iframe.

Image artifacts arrive as a spec first (`content.imagePrompt`), then the client calls `POST /api/generate-image`, which asks an OpenRouter image model (default Gemini 3.1 Flash Lite Image) for the actual picture and returns it as a base64 data URL stored in `content.imageUrl`.
