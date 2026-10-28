# APN & JIA — A universe of our own

An immersive 3D anniversary keepsake: three song planets, a floating photo, a spiral of stardust, and a letter for Jia.

## Run locally

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Open the local URL printed by Vite. Music starts after a click or tap.

```sh
npm run lint
npm run build
npm run preview -- --host 127.0.0.1
```

## Explore

- Drag the galaxy to orbit. Scroll or pinch to zoom. Reset view returns to the original composition.
- With the scene focused, use arrow keys to orbit, + / - to zoom, and Home to reset.
- Choose a 3D planet, its label, or a soundtrack tile to play its song. Choose it again to pause. Changing songs gently reframes the camera.
- The player supports previous/next, seeking, and desktop volume/mute controls.
- Open the floating photo; five taps reveal the original secret letter. The letter is also available from the header.
- Pause motion freezes the ambient animation. The page also respects reduced motion preferences.
- Native dialogs support Escape, contain keyboard focus, and return focus to the trigger.

## Implementation

`src/components/Galaxy.tsx` owns the Three.js scene: procedural planet shaders, nebula noise, a batched spiral of particles, the framed photo, pointer picking, and camera controls. The scene loads separately from the UI. Rendering is capped at 30 fps on phones and 45 fps on desktop, with a maximum pixel ratio of 1.5. Rendering stops in hidden tabs, and resources are disposed on unmount.

If WebGL is unavailable or its context is lost, a photo and ordinary song buttons remain available. Playback uses a single native audio element and continues independently of scene rendering.

Song metadata and messages are in `src/data/songs.ts`. The letter is in `src/components/LoveLetter.tsx`. Design and responsive styles are in `src/index.css`.

Optimized WebP images are included alongside the original JPEGs. Regenerate them with `python optimize-images.py` and Pillow installed. Personal photos, music, and the letter are static assets; review them before publishing. This local workflow does not push or deploy anything.
