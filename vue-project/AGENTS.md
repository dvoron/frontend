# Repository Guidelines

## Project Structure & Module Organization

This is a Vue 3 single-page application built with Vite. Application entry and routing live in `src/main.js`; the root shell is `src/App.vue`. Keep user-facing views in `src/components/`, reusable SVG/UI pieces in its relevant subdirectories, shared styles and images in `src/assets/`, Pinia state in `src/stores/`, API clients in `src/services/`, and request payload models in `src/dto/`. Static files that should be served unchanged belong in `public/`.

Use the `@` alias for imports from `src` (for example, `@/components/Header.vue`). The Vite dev server proxies `/api` to `http://localhost:8080`; keep backend calls relative to `/api` rather than hard-coding a host.

## Build, Test, and Development Commands

- `npm install` installs the locked project dependencies (use Node 20.19+ or 22.12+).
- `npm run dev` starts the Vite development server with hot reload.
- `npm run build` creates the production bundle and is the required pre-change validation.
- `npm run preview` serves the built bundle locally for a final smoke test.

There are currently no automated test, lint, or formatting scripts. Do not claim a test suite passed unless one is added; manually exercise altered routes and authentication flows instead.

## Coding Style & Naming Conventions

Follow the existing Vue single-file component style: use `<script setup>`, two-space indentation in templates and styles, and semicolons only where the surrounding JavaScript uses them. Name Vue components in PascalCase (for example, `UserProfile.vue`), Pinia stores and service methods in camelCase, and DTO classes with descriptive PascalCase names such as `CreateUserDto.js`. Keep imports grouped at the top and prefer the `@` alias over long relative paths.

## Testing Guidelines

When adding tests, colocate them with the feature or use a `tests/` directory, and name them `*.spec.js` or `*.spec.ts`. Cover new routes, store behavior, and service error handling. Until a test runner is configured, run `npm run build` and verify affected UI behavior using `npm run dev`.

## Commit & Pull Request Guidelines

Recent history uses brief, imperative summaries (for example, `Adding .gitignore file` and `Frontend now communicates with backend`). Write a focused subject describing the change; avoid mixing unrelated refactors. Pull requests should explain the user-visible impact, link related issues when available, list validation performed, and include screenshots for visual changes. Note required backend/API configuration explicitly.
