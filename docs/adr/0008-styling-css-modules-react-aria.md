# 0008. Styling with CSS Modules and React Aria

- Status: Accepted
- Date: 2026-11-09

## Context

Every screen needs a consistent look, WCAG 2.2 AA contrast and focus, and accessible complex
widgets (dialogs, segmented RPE controls). The developer knows React well. The bundle should
stay small for a mobile PWA.

## Decision

- **CSS Modules** (built into Vite) for component styles; no CSS framework.
- **Design tokens** as CSS custom properties in one file: colours (light and dark), spacing,
  type scale, radii, focus ring. Components use tokens, never raw values.
- **React Aria Components** (Adobe) for widgets that are hard to make accessible: dialogs,
  radio/segmented groups, toasts, focus management. Plain HTML elements for everything else.

## Alternatives

- **Tailwind:** fast, but busier markup; accessible widgets still need building.
- **MUI or similar:** quickest, but heavier, generic-looking, and hides our own UX work.
- **Microfrontends:** worth it for separate teams or deploys. Here there is one team and one
  deploy, and exercise demos are one component inside the app. Revisit if that changes.

## Consequences

- ➕ Small bundle, scoped styles, visible CSS skill; tested accessibility for tricky widgets.
- ➖ We build our own components and keep tokens disciplined.
- ➖ One dependency (`react-aria-components`), pinned and updated deliberately.
