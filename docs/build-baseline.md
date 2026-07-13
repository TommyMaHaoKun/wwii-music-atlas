# Build Baseline

Date: 2026-04-19

## Phase 2 baseline

- Goal: track bundle size and release readiness while polishing editorial quality.
- Build command: `npm run build`
- Test commands: `npm test`, `npm run test:e2e`

## Current build output

- `dist/assets/index-CWf1aFml.js`: 96.90 kB, gzip 36.00 kB
- `dist/assets/atlas-data-3bKk1DHS.js`: 175.48 kB, gzip 63.24 kB
- `dist/assets/globe-vendor-Jm43c2-o.js`: 1,793.18 kB, gzip 507.88 kB
- `dist/assets/GlobeStage-Bu0azYsC.js`: 6.83 kB, gzip 3.10 kB
- `dist/assets/index-CC3Y2n8g.css`: 16.60 kB, gzip 3.87 kB

## Notes

- The globe experience has been split into async-loaded and vendor-chunked assets to reduce first-load pressure on the main application shell.
- This background-playlist pass added a small player shell and nudged the main CSS/JS upward, while `globe-vendor` stayed flat.
- Local background audio assets now add about 7.08 MB to the repository (`public/audio/background/`), which stays inside the 15 MB target for v1.
- `globe.gl` still pulls a `THREE.Clock` deprecation warning through the upstream dependency chain. This is currently documented and accepted because it does not break runtime behavior.
- Background music is now local and open-license-first, while `Sources` remains archive-first and may still expose record links instead of direct playback.
