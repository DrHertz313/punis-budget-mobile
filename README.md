# The PUNIs Budget Mobile

A mobile-first React + Vite + Tailwind + PWA budget tracker.

## Run locally

```bash
npm install
npm run dev
```

## Build for PWA

```bash
npm run build
npm run preview
```

## Install on phone

After hosting the built app:
- Android Chrome: open the site and choose Install app or Add to Home screen
- iPhone Safari: open the site, tap Share, then Add to Home Screen

## GitHub Pages deployment

Use the included `.github/workflows/deploy.yml` file.

Then in GitHub:
- Settings
- Pages
- Source: GitHub Actions


## If npm install fails
This package pins versions that work together. If your npm cache still holds an older resolution, delete `node_modules` and `package-lock.json` if present, then run `npm install` again.
