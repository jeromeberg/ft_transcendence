# Modules

### Web

| Module | Type | Points | Justification | Implementation | Contributors |
|--------|------|--------|---------------|----------------|--------------|
| Frontend Framework (React) | Minor | 1 | Component-based architecture, large ecosystem, fast dev builds with Vite | SPA with React, Vite, TypeScript, Tailwind and react-router | jbergero |
| Backend Framework (NestJS) | Minor | 1 | Structured, opinionated architecture with built-in support for WebSockets, validation, and dependency injection | REST API, authentication, validation, WebSocket gateways | kpires |
| Real-time Communication (WebSockets) | Major | 2 | Required for synchronized game state, live chat, and real-time status updates across all connected clients | Used for chat, matchmaking, game synchronization and status | akdovlet, jbergero, kpires |
| User Interaction System | Major | 2 | Core social features enabling the multiplayer and community experience | Friends system, chat, profiles, status | jbergero, kpires |
| ORM | Minor | 1 | Type-safe database access with auto-generated TypeScript types, simplifying migrations and schema management | Type-safe database schema and migrations using Prisma | kpires |
| Design System | Minor | 1 | Ensures visual consistency and reduces duplication across the frontend | Reusable UI components (Alert, Avatar, Btn, Container, Heading, Label, Input, TextArea, Text, List, Modal, Pagination, AuthForm...) built with Tailwind | jbergero |
| Advanced Search | Minor | 1 | Improves leaderboard UX with filtering and pagination for large datasets | Paginated search with filters | trolland |

**Web subtotal: 9 points**

### Accessibility & Internationalization

| Module | Type | Points | Justification | Implementation | Contributors |
|--------|------|--------|---------------|----------------|--------------|
| Internationalization | Minor | 1 | Required to support a diverse international user base. Three languages chosen to demonstrate scalability of the i18n implementation | Full i18n translation (EN/FR/ES) across frontend and backend | kpires |
| Additional Browser Support | Minor | 1 | Ensures a consistent experience across major browsers used by the target audience | Tested on Chromium, Safari and Firefox browsers, made fixes for MacOS (scrollbar) | Team |

**Accessibility & Internationalization subtotal: 2 points**

### User Management

| Module | Type | Points | Justification | Implementation | Contributors |
|--------|------|--------|---------------|----------------|--------------|
| Standard User Management | Major | 2 | Foundation for all user-facing features. Secure authentication is a prerequisite for a competitive multiplayer app | Authentication, account settings, password management | kpires, jbergero, axbaudri |
| OAuth 42 Authentication | Minor | 1 | Provides seamless login for 42 students, the primary target audience, without requiring a separate password | OAuth 2.0 login with 42 provider | kpires |
| Game Statistics & Match History | Minor | 1 | Enables players to track progress, compare performance, and review past races | WPM tracking, accuracy, match history | jbergero, kpires, akdovlet |

**User Management subtotal: 4 points**

### Gaming & Experience

| Module | Type | Points | Justification | Implementation | Contributors |
|--------|------|--------|---------------|----------------|--------------|
| Web-Based Game | Major | 2 | Core module, the typing race game is the main value proposition of the project | Real-time typing game with matchmaking | akdovlet |
| Multiplayer (>2 Players) | Major | 2 | Enhances replayability and competitive experience by allowing larger lobbies | Multi-user synchronized races | akdovlet |
| Gamification System | Minor | 1 | Increases engagement and retention through unlockable achievements, XP-based level progression, and a competitive leaderboard | Achievement system, XP/level progression, and persistent leaderboard | jbergero, kpires |

**Gaming & Experience subtotal: 5 points**

### Modules of choice

| Module | Type | Points | Justification | Implementation | Contributors |
|--------|------|--------|---------------|----------------|--------------|
| Anti-Cheat System | Major | 2 | Prevents WPM manipulation and score injection. All game state is authoritative server-side, ensuring fair competition | WPM cap (250 WPM), time-based progress validation, minimum update intervals, input DTO validation, finish time clamping, and silent score rejection on violations | akdovlet |
| Public Web Access via Cloudflare Tunnel | Minor | 1 | Enables public demo access without infrastructure changes or port forwarding, useful for evaluations and demos | Securely exposes the application through a public domain with HTTPS without requiring port forwarding | trolland |

**Custom subtotal: 3 points**

### Final Total

| Category | Points |
|----------|--------|
| Web | 9 |
| Accessibility & Internationalization | 2 |
| User Management | 4 |
| Gaming & Experience | 5 |
| Modules of choice | 3 |

**TOTAL: 23 points**