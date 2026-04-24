# Byleen Janet Roy Portfolio

A high-end Angular portfolio built as a single-page immersive experience with neon violet and deep blue gradients, glassmorphism panels, GSAP-powered motion, and a lazy-loaded Three.js particle background.

## Stack

- Angular 21 with standalone components
- SCSS
- Angular Animations
- GSAP with ScrollTrigger
- Three.js loaded on demand for the hero background

## Sections

- Hero with animated intro, typing effect, CTA buttons, particles, and metrics
- About with glassmorphism cards and animated reveal
- Skills with animated capability bars
- Projects with glow cards, 3D tilt interaction, and expandable modal
- Experience timeline
- Achievements and leadership sections
- Contact panel and frontend-only form

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:4200/` in the browser.

## Production build

```bash
npm run build
```

The production bundle is emitted to `dist/portfolio`.

## Test command

```bash
npm test
```

## Notes

- The particle background uses a lazy chunk so Three.js does not bloat the initial page load.
- The contact form is frontend-only and routes users to email via `mailto:`.
